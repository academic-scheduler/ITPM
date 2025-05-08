# backend/smart_assistant/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('find-slot/', views.find_available_slot, name='find_slot'),
]