from django.contrib import admin

from .models import Attachment


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):

    list_display = (
        "file_name",
        "file_size",
        "created_by",
        "lead",
        "deal",
        "company",
        "ticket",
        "created_at",
    )

    search_fields = (
        "file_name",
    )

    list_filter = (
        "created_at",
    )

    readonly_fields = (
        "file_size",
        "created_at",
        "updated_at",
    )

    ordering = (
        "-created_at",
    )