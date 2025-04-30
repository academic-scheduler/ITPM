from rest_framework import viewsets # type: ignore
from .models import Room, Schedule, RoomRequest, Maintenance ,RoomOccupancy
from .serializers import RoomSerializer, ScheduleSerializer, RoomRequestSerializer, MaintenanceSerializer, RoomOccupancySerializer
from rest_framework.decorators import api_view # type: ignore
from rest_framework.response import Response # type: ignore



class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer

class ScheduleViewSet(viewsets.ModelViewSet):
    queryset = Schedule.objects.all()
    serializer_class = ScheduleSerializer


class MaintenanceViewSet(viewsets.ModelViewSet):
    queryset = Maintenance.objects.all()
    serializer_class = MaintenanceSerializer


class RoomRequestViewSet(viewsets.ModelViewSet):
    queryset = RoomRequest.objects.all().select_related('requested_by', 'room')
    serializer_class = RoomRequestSerializer
    
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

class RoomOccupancyViewSet(viewsets.ModelViewSet):
    queryset = RoomOccupancy.objects.all().select_related('room')
    serializer_class = RoomOccupancySerializer