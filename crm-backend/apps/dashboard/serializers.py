from rest_framework import serializers

from apps.users.models import User
from apps.deals.models import Deal


class DashboardDealSerializer(serializers.ModelSerializer):

    class Meta:
        model = Deal
        fields = (
            "id",
            "deal_name",
            "amount",
            "stage",
            "close_date",
        )


class DashboardUserSerializer(serializers.ModelSerializer):

    deals = DashboardDealSerializer(
        source="assigned_deals",
        many=True,
        read_only=True
    )

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "deals",
        )