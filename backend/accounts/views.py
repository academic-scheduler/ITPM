# accounts/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from .models import Profile
from .serializers import ProfileSerializer
from django.http import JsonResponse

@api_view(['POST'])
def api_login(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        auth_login(request, user)
        return Response({'message': 'Login successful', 'username': username})
    else:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def api_logout(request):
    auth_logout(request)
    return Response({'message': 'Logged out successfully'})
    
@api_view(['POST'])
def login_user(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response({'error': 'Both username and password are required'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(username=username, password=password)
    
    if user:
        token, created = Token.objects.get_or_create(user=user)
        try:
            profile = Profile.objects.get(user=user)
            role = 'instructor' if profile.is_instructor else (
                'lecturer' if profile.is_lecturer else 'student'
            )
        except Profile.DoesNotExist:
            role = 'student'
            
        return Response({
            'token': token.key,
            'user_id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': role
        }, status=status.HTTP_200_OK)
    else:
        return Response({'error': 'Invalid credentials'}, 
                       status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
def register_user(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password1')
    password2 = data.get('password2')
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role = data.get('role')

    # Validate required fields
    if not username or not email or not password or not first_name or not last_name or not role:
        return Response({'error': 'All fields are required'}, status=status.HTTP_400_BAD_REQUEST)

    # Validate password confirmation
    if password != password2:
        return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already taken'}, status=status.HTTP_400_BAD_REQUEST)

    # Create the User
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )

    # Create Profile and assign role
    profile = Profile.objects.create(user=user)
    if role == 'instructor':
        profile.is_instructor = True
    elif role == 'lecturer':
        profile.is_lecturer = True
    profile.save()

    serializer = ProfileSerializer(profile)
    return Response(serializer.data, status=status.HTTP_201_CREATED)

@api_view(['GET'])
def get_users(request):
    try:
        users = User.objects.all()
        data = []
        for user in users:
            try:
                profile = Profile.objects.get(user=user)
                role = 'instructor' if profile.is_instructor else (
                    'lecturer' if profile.is_lecturer else 'student'
                )
            except Profile.DoesNotExist:
                role = 'student'
            data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'role': role,
            })
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@api_view(['PUT'])
def edit_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
        profile = Profile.objects.get(user=user)
    except (User.DoesNotExist, Profile.DoesNotExist):
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    # Update User fields
    user_data = request.data.get('user', {})
    user.username = user_data.get('username', user.username)
    user.email = user_data.get('email', user.email)
    user.first_name = user_data.get('first_name', user.first_name)
    user.last_name = user_data.get('last_name', user.last_name)
    user.save()

    # Update Profile fields
    profile.is_instructor = request.data.get('is_instructor', profile.is_instructor)
    profile.is_lecturer = request.data.get('is_lecturer', profile.is_lecturer)
    profile.save()

    serializer = ProfileSerializer(profile)
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_user(request, pk):
    try:
        user = User.objects.get(pk=pk)
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

    user.delete()
    return Response({'message': 'User deleted successfully'}, status=status.HTTP_204_NO_CONTENT)
