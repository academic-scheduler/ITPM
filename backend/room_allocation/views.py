from rest_framework import viewsets # type: ignore
from .models import Room, Schedule, RoomRequest, Maintenance
from .serializers import RoomSerializer, ScheduleSerializer, RoomRequestSerializer, MaintenanceSerializer
from rest_framework.decorators import api_view # type: ignore
from rest_framework.response import Response # type: ignore



class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer

class RoomRequestViewSet(viewsets.ModelViewSet):
    queryset = RoomRequest.objects.all()
    serializer_class = RoomRequestSerializer

class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceSerializer


