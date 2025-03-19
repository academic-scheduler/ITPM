# from django.urls import path # type: ignore

# from . import views

# urlpatterns = [
#     path('register', views.register, name = 'register'),
#     path('login', views.login, name='login'),
#     path('logout', views.logout, name='logout')
# ]

from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.api_login, name='api_login'),
    path('api/logout/', views.api_logout, name='api_logout'),
    path('register/', views.register_user, name='api_register'),
]
