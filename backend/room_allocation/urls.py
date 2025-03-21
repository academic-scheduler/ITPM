from django.urls import path
from .views import RoomViewSet, ScheduleViewSet, RoomRequestViewSet, MaintenanceViewSet
from rest_framework.routers import DefaultRouter
from django.urls import path,include

router = DefaultRouter()
router.register(r'rooms', RoomViewSet)
router.register(r'schedules', ScheduleViewSet)
router.register(r'room-requests', RoomRequestViewSet)
router.register(r'maintenance', MaintenanceViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
