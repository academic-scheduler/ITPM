# backend/smart_assistant/views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_datetime
from datetime import timedelta
import pytz
from .models import InstructorDetails, RoomAllocation
import json

@csrf_exempt
def find_available_slot(request):
    if request.method != 'POST':
        return JsonResponse({'error': 'Method not allowed'}, status=405)

    try:
        # Parse JSON data from request body
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON format'}, status=400)

    # Extract parameters with validation
    instructor_id = data.get('instructor_id')
    room_id = data.get('room_id')
    start_time_str = data.get('start_time')
    end_time_str = data.get('end_time')

    if not all([instructor_id, room_id, start_time_str, end_time_str]):
        return JsonResponse({'error': 'Missing required parameters'}, status=400)

    try:
        # Convert string timestamps to datetime objects
        start_time = parse_datetime(start_time_str)
        end_time = parse_datetime(end_time_str)
        
        # Handle timezone for naive datetimes
        if start_time and not start_time.tzinfo:
            start_time = pytz.timezone('Asia/Kolkata').localize(start_time)
        if end_time and not end_time.tzinfo:
            end_time = pytz.timezone('Asia/Kolkata').localize(end_time)

        duration = end_time - start_time

    except (ValueError, TypeError) as e:
        return JsonResponse({'error': f'Invalid datetime format: {str(e)}'}, status=400)

    
    current_start = start_time
    max_attempts = 100
    attempts = 0

    while attempts < max_attempts:
        # Check instructor availability
        instructor_conflict = InstructorDetails.objects.filter(
            instructor_id=instructor_id,
            start_time__lt=current_start + duration,
            end_time__gt=current_start
        ).exists()

        if not instructor_conflict:
            # Check room availability
            room_conflict = RoomAllocation.objects.filter(
                room_id=room_id,
                start_time__lt=current_start + duration,
                end_time__gt=current_start
            ).exists()

            if not room_conflict:
                return JsonResponse({
                    'start_time': current_start.isoformat(),
                    'end_time': (current_start + duration).isoformat()
                })
            else:
                # Find next room availability
                current_start = find_next_available(RoomAllocation, 'room_id', room_id, current_start, duration)
        else:
            # Find next instructor availability
            current_start = find_next_available(InstructorDetails, 'instructor_id', instructor_id, current_start, duration)

        attempts += 1

    return JsonResponse({'error': 'No available slot found'}, status=404)

def find_next_available(model, resource_field, resource_id, after_time, duration):
    bookings = model.objects.filter(
        **{resource_field: resource_id},
        end_time__gt=after_time
    ).order_by('start_time')

    next_start = after_time
    for booking in bookings:
        if next_start + duration <= booking.start_time:
            return next_start
        next_start = max(next_start, booking.end_time)
    return next_start