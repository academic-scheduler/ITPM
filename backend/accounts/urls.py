from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user, name='api_register'),
    path('login/', views.api_login, name='api_login'),
    path('logout/', views.api_logout, name='api_logout'),
    path('get-user-details/', views.get_users, name='api_get_users'),
    path('edit-user/<int:pk>/', views.edit_user, name='api_edit_user'),
    path('delete-user/<int:pk>/', views.delete_user, name='api_delete_user'),
    path('get-user-by-username/', views.get_user_by_username, name='get_user_by_username'),
    path('get-user-room-requests/', views.get_user_room_requests, name='get_user_room_requests'),
]