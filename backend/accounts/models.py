# accounts/models.py
from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    is_instructor = models.BooleanField(default=False)
    is_lecturer = models.BooleanField(default=False)
    is_student = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.user.username} Profile"
