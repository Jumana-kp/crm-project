from django.contrib import admin
from .models import Lead

# Register your models here.
@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):

    list_display = (
        "first_name",
        "last_name",
        "owner_names",
        "email",
        "phone_number",
        "company",
        "lead_status",
        "city",
        "created_at",
    )

    search_fields = (
        "first_name",
        "last_name",
        "email",
        "phone_number",
    )

    list_filter = (
        "lead_status",
        "city",
        "created_at",
    )

    filter_horizontal = (
        "contact_owners",
        "products",
    )

    ordering = (
        "-created_at",
    )

    def owner_names(self, obj):
        return ", ".join(
            user.get_full_name() or user.email
            for user in obj.contact_owners.all()
        )

    owner_names.short_description = "Contact Owners"