from django.contrib import admin

from .models import Deal


@admin.register(Deal)
class DealAdmin(admin.ModelAdmin):

    list_display = (
        "deal_name",
        "lead",
        "owner_names",
        "stage",
        "amount",
        "close_date",
        "priority",
        "created_at",
    )

    search_fields = (
        "deal_name",
        "lead__first_name",
        "lead__last_name",
    )

    list_filter = (
        "stage",
        "priority",
        "close_date",
    )

    filter_horizontal = (
        "owners",
    )

    ordering = (
        "-created_at",
    )

    def owner_names(self, obj):
        return ", ".join(
            user.get_full_name() or user.email
            for user in obj.owners.all()
        )

    owner_names.short_description = "Deal Owners"