# backend/smart_assistant/models.py
from django.db import models

class InstructorDetails(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    instructor_id = models.IntegerField()

    class Meta:
        db_table = 'smart_assistant_instructor_details'

class RoomAllocation(models.Model):
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    room_id = models.IntegerField()

    class Meta:
        db_table = 'room_allocation_occupency'