from django.contrib import admin

from .models import Email, EmailAttachment


@admin.register(Email)
class EmailAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "subject",
        "sent_by",
        "status",
        "lead",
        "deal",
        "company",
        "ticket",
        "sent_at",
        "created_at",
    ]

    list_filter = [
        "status",
        "created_at",
        "sent_at",
    ]

    search_fields = [
        "subject",
        "body",
        "sent_by__email",
        "sent_by__first_name",
        "sent_by__last_name",
    ]

    readonly_fields = [
        "sent_at",
        "created_at",
        "updated_at",
    ]

    ordering = [
        "-created_at"
    ]


@admin.register(EmailAttachment)
class EmailAttachmentAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "email",
        "file",
        "created_at",
    ]

    search_fields = [
        "email__subject",
        "file",
    ]

    readonly_fields = [
        "created_at",
    ]

    ordering = [
        "-created_at"
    ]