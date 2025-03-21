# models.py

from django.db import models # type: ignore
from django.contrib.auth.models import User # type: ignore

class Room(models.Model):
    name = models.CharField(max_length=100, unique=True)
    capacity = models.IntegerField()
    location = models.CharField(max_length=200)
    room_type = models.CharField(max_length=50)
    has_ac = models.BooleanField(default=False)
    has_projector = models.BooleanField(default=False)
    has_whiteboard = models.BooleanField(default=False)
    has_sound_system = models.BooleanField(default=False)
    has_wifi = models.BooleanField(default=False)
    availability = models.BooleanField(default=True)

    def __str__(self):
        return self.name

class Schedule(models.Model):
    course_code = models.CharField(max_length=20)
    course_name = models.CharField(max_length=100)
    instructor = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, default="scheduled")

    def __str__(self):
        return f"{self.course_code} - {self.room.name}"

class RoomRequest(models.Model):
    requested_by = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("approved", "Approved"), ("rejected", "Rejected"), ("canceled", "Canceled")], default="pending")

    def __str__(self):
        return f"Request for {self.room.name} by {self.requested_by.username}"

class Maintenance(models.Model):
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE)
    issue_description = models.TextField()
    status = models.CharField(max_length=20, choices=[("pending", "Pending"), ("resolved", "Resolved")], default="pending")

    def __str__(self):
        return f"Issue in {self.room.name}: {self.status}"
