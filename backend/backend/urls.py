from django.contrib import admin  # type: ignore
from django.urls import path, include  # type: ignore

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/add-course/', include('course_management.urls')),
    path('api/room-allocation/', include('room_allocation.urls')),
    path('api/smart-assistant/', include('smart_assistant.urls')),
]