
from rest_framework import serializers
from apps.users.models import User
from .models import Company


class UserNestedSerializer(
    serializers.ModelSerializer
):
    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
        ]


class CompanySerializer(
    serializers.ModelSerializer
):

    company_owners = UserNestedSerializer(
        many=True,
        read_only=True
    )

    company_owner_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        source="company_owners",
        write_only=True
    )

    class Meta:
        model = Company

        fields = [
            "id",
            "domain_name",
            "company_name",
            "company_owners",
            "company_owner_ids",
            "industry",
            "company_type",
            "city",
            "country",
            "no_of_employees",
            "annual_revenue",
            "phone_number",
            "email",
            "created_at",
            "updated_at",
        ]