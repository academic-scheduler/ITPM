from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login as auth_login, logout as auth_logout
from .models import Profile  # Import the Profile model
from django.http import JsonResponse  # Add this import

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
def register_user(request):
    data = request.data
    username = data.get('username')
    email = data.get('email')
    password = data.get('password1')
    password2 = data.get('password2')  # Add password confirmation
    first_name = data.get('first_name')
    last_name = data.get('last_name')
    role = data.get('role')  # Get the role (student, lecturer, or instructor)

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
    
    # Assign the role to the user profile
    if role == 'student':
        profile.is_student = True
    elif role == 'lecturer':
        profile.is_lecturer = True
    elif role == 'instructor':
        profile.is_instructor = True
    else:
        return Response({'error': 'Invalid role. Choose "student", "lecturer", or "instructor".'},
                        status=status.HTTP_400_BAD_REQUEST)
    
    profile.save()
    
    return Response({'message': 'User created successfully'}, status=status.HTTP_201_CREATED)


def get_user(request):
    # Get the user_id from the query parameters
    user_id = request.GET.get('user_id')

    if not user_id:
        return JsonResponse({'error': 'user_id is required'}, status=400)

    try:
        # Fetch the user from the auth_user table
        user = User.objects.get(id=user_id)
        # Prepare the response data
        data = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
        }
        return JsonResponse(data)
    except User.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)
    

    
@api_view(['GET'])
def get_user_by_username(request):
    """
    Get user details by username
    """
    username = request.GET.get('username')
    if not username:
        return Response({'error': 'username parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_active': user.is_active
        })
    except User.DoesNotExist:
        return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def get_user_room_requests(request):
    """
    Get room requests for a specific user
    """
    user_id = request.GET.get('user_id')
    if not user_id:
        return Response({'error': 'user_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Assuming you have a RoomRequest model
        from room_allocation.models import RoomRequest
        requests = RoomRequest.objects.filter(requested_by=user_id)
        serialized_requests = [{
            'id': req.id,
            'room': req.room.id,
            'start_time': req.start_time,
            'end_time': req.end_time,
            'status': req.status,
            'requested_by': req.requested_by.id
        } for req in requests]
        return Response(serialized_requests)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)