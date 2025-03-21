from django.contrib import admin # type: ignore
from .models import Room, Schedule, RoomRequest, Maintenance

# Register your models here.

admin.site.register(Room)
admin.site.register(Schedule)
admin.site.register(RoomRequest)
admin.site.register(Maintenance)