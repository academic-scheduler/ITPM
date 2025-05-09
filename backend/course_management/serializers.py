from rest_framework import serializers
from .models import Course

class CourseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'course_code', 'course_name', 'credits', 'description', 'status']

    def validate_credits(self, value):
        if value > 10:
            raise serializers.ValidationError("Credits cannot exceed 10.")
        return value

    def validate_course_name(self, value):
        if not value.replace(' ', '').isalpha():
            raise serializers.ValidationError("Course name can only contain alphabetic characters and spaces.")
        return value