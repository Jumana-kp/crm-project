from django.contrib import admin

from .models import Note


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "created_by",
        "lead",
        "deal",
        "company",
        "ticket",
        "created_at",
        "updated_at",
    )

    search_fields = (
        "title",
        "content",
        "created_by__email",
        "created_by__first_name",
        "created_by__last_name",
    )

    list_filter = (
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )