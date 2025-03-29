from django.urls import path # type: ignore
from .views import RoomViewSet, ScheduleViewSet, RoomRequestViewSet, MaintenanceViewSet, RoomOccupancyViewSet
from rest_framework.routers import DefaultRouter # type: ignore
from django.urls import path,include # type: ignore

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'room-requests', RoomRequestViewSet)
router.register(r'maintenance', MaintenanceViewSet)
router.register(r'room-occupancy', RoomOccupancyViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
