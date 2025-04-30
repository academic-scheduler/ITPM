from rest_framework import viewsets, status
from rest_framework.response import Response
from django.db.models import Q
from .models import Course
from .serializers import CourseSerializer

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer

    def get_queryset(self):
        queryset = Course.objects.all()
        # Get query parameters from the request
        search_query = self.request.query_params.get('search', '')
        if search_query:
            # Filter by course_code, course_name, or description
            queryset = queryset.filter(
                Q(course_code__icontains=search_query) |
                Q(course_name__icontains=search_query) |
                Q(description__icontains=search_query)
            )
        return queryset

    def create(self, request, *args, **kwargs):
        try:
            credits = float(request.data.get('credits'))
            if credits > 10:
                return Response({"error": "Credits cannot exceed 10."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Credits must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, *args, **kwargs):
        try:
            credits = float(request.data.get('credits'))
            if credits > 10:
                return Response({"error": "Credits cannot exceed 10."}, status=status.HTTP_400_BAD_REQUEST)
        except ValueError:
            return Response({"error": "Credits must be a number."}, status=status.HTTP_400_BAD_REQUEST)

        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)