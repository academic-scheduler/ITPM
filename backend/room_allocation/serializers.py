from rest_framework import serializers  # type: ignore
from .models import Room, Schedule, RoomRequest, Maintenance, RoomOccupancy
from django.contrib.auth.models import User  # type: ignore

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'

class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maintenance
        fields = '__all__'

class RoomRequestSerializer(serializers.ModelSerializer):
    requested_by = UserSerializer(read_only=True)
    room = RoomSerializer(read_only=True)
    requested_by_id = serializers.PrimaryKeyRelatedField(
        source='requested_by',
        queryset=User.objects.all(),
        write_only=True
    )
    room_id = serializers.PrimaryKeyRelatedField(
        source='room',
        queryset=Room.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = RoomRequest
        fields = [
            'id', 
            'requested_by', 
            'requested_by_id',
            'room', 
            'room_id',
            'start_time', 
            'end_time', 
            'status'
        ]

class RoomOccupancySerializer(serializers.ModelSerializer):
    room = RoomSerializer(read_only=True)
    room_id = serializers.PrimaryKeyRelatedField(
        source='room', 
        queryset=Room.objects.all(),
        write_only=True
    )
    
    class Meta:
        model = RoomOccupancy
        fields = ['id', 'start_time', 'end_time', 'room', 'room_id']