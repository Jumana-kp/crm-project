from django.contrib import admin

from django.contrib import admin

# Register your models here.
from django.contrib import admin

from .models import Meeting


@admin.register(Meeting)
class MeetingAdmin(admin.ModelAdmin):

    list_display = [
        "title",
        "start_date",
        "start_time",
        "end_time",
        "created_by",
        "location",
        "reminder",
        "created_at",
    ]

    list_filter = [
        "start_date",
        "reminder",
        "created_at",
    ]

    search_fields = [
        "title",
        "location",
        "note",
        "created_by__email",
    ]

    filter_horizontal = [
        "attendees",
    ]

    ordering = [
        "start_date",
        "start_time",
    ]
