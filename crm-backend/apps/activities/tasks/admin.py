
from django.contrib import admin

from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):

    list_display = (
        "task_name",
        "due_date",
        "due_time",
        "task_type",
        "priority",
        "status",
        "display_assigned_to",
        "created_by",
        "created_at",
    )

    search_fields = (
        "task_name",
        "note",
        "assigned_to__email",
        "created_by__email",
    )

    list_filter = (
        "task_type",
        "priority",
        "status",
        "due_date",
    )

    ordering = (
        "due_date",
        "due_time",
    )

    @admin.display(description="Assigned To")
    def display_assigned_to(self, obj):
        return ", ".join(
            user.get_full_name() or user.email
            for user in obj.assigned_to.all()
        )