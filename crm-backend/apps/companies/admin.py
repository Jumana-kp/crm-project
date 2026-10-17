from django.contrib import admin
from .models import Company
# Register your models here.

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):

    list_display = (
        "company_name",
        "owner_names",
        "domain_name",
        "email",
        "industry",
        "company_type",
        "country",
        "created_at",
    )

    search_fields = (
        "company_name",
        "domain_name",
        "email",
    )

    list_filter = (
        "industry",
        "company_type",
        "country",
    )

    filter_horizontal = (
        "company_owners",
    )

    ordering = (
        "-created_at",
    )

    def owner_names(self, obj):
        return ", ".join(
            user.get_full_name() or user.email
            for user in obj.company_owners.all()
        )

    owner_names.short_description = "Company Owners"