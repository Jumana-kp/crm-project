from django.contrib import admin

from django.contrib import admin

from .models import Call


@admin.register(Call)
class CallAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "created_by",
        "lead",
        "deal",
        "company",
        "ticket",
        "call_outcome",
        "call_date",
        "call_time",
        "duration",
        "created_at",
    ]

    list_filter = [
        "call_outcome",
        "call_date",
        "created_at",
    ]

    search_fields = [
        "note",
        "lead__first_name",
        "lead__last_name",
        "lead__email",
        "deal__deal_name",
        "company__company_name",
    ]

    ordering = [
        "-call_date",
        "-call_time",
    ]

    readonly_fields = [
        "created_at",
        "updated_at",
    ]
