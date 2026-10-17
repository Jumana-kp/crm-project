from django.contrib import admin
from .models import Ticket


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):

    list_display = (
        "ticket_name",
        "associated_deal",
        "ticket_status",
        "priority",
        "source",
        "get_ticket_owners",
        "created_at",
    )

    search_fields = (
        "ticket_name",
        "description",
    )

    list_filter = (
        "ticket_status",
        "priority",
        "source",
    )

    filter_horizontal = (
        "ticket_owners",
    )

    ordering = (
        "-created_at",
    )

    def get_ticket_owners(self, obj):
        return ", ".join(
            user.get_full_name() or user.email
            for user in obj.ticket_owners.all()
        )

    get_ticket_owners.short_description = "Ticket Owners"