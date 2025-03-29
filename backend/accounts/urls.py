from django.urls import path # type: ignore
from . import views

urlpatterns = [
    path('login/', views.api_login, name='api_login'),
    path('logout/', views.api_logout, name='api_logout'),
    path('register/', views.register_user, name='api_register'),
    path('get-user-details/', views.get_user, name='api_get_user'),
    path('get-user-by-username/', views.get_user_by_username, name='get_user_by_username'),
    path('get-user-room-requests/', views.get_user_room_requests, name='get_user_room_requests'),
]
