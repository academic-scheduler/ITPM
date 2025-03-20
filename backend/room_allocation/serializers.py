from rest_framework import serializers # type: ignore
from .models import Room, Schedule, RoomRequest, Maintenance

class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'

class ScheduleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Schedule
        fields = '__all__'

class RoomRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomRequest
        fields = '__all__'

class MaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Maintenance
        fields = '__all__'
