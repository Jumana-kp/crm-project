from rest_framework import serializers

from .models import Deal
from apps.users.models import User
from apps.leads.models import Lead


# =========================================================
# DEAL OWNER SERIALIZER
# =========================================================

class DealOwnerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
        ]


# =========================================================
# DEAL LEAD SERIALIZER
# =========================================================

class DealLeadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lead
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "country_code",     # ✅ ADDED
            "phone_number",     # ✅ ALREADY PRESENT
            "city",
            "lead_status",
        ]


# =========================================================
# DEAL SERIALIZER
# =========================================================

class DealSerializer(serializers.ModelSerializer):

    lead = DealLeadSerializer(
        read_only=True
    )

    owners = DealOwnerSerializer(
        many=True,
        read_only=True
    )

    lead_id = serializers.PrimaryKeyRelatedField(
        queryset=Lead.objects.all(),
        source="lead",
        write_only=True,
        required=True
    )

    owner_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        source="owners",
        write_only=True,
        required=False
    )

    class Meta:
        model = Deal

        fields = [
            "id",
            "deal_name",
            "lead",
            "lead_id",
            "owners",
            "owner_ids",
            "amount",
            "stage",
            "priority",
            "close_date",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    # =====================================================
    # DEAL NAME VALIDATION
    # =====================================================

    def validate_deal_name(self, value):
        value = str(value).strip()

        if not value:
            raise serializers.ValidationError(
                "Deal Name is required."
            )

        if len(value) < 3:
            raise serializers.ValidationError(
                "Deal Name must contain at least 3 characters."
            )

        return value

    # =====================================================
    # LEAD VALIDATION
    # =====================================================

    def validate_lead_id(self, lead):
        """
        On create, only Qualified Leads can be associated.

        On update, the existing Lead can remain associated even
        if its status has changed to Converted. A different Lead
        must be Qualified.
        """

        if self.instance is None:

            lead_status = str(
                getattr(lead, "lead_status", "")
            ).strip().lower()

            if lead_status != "qualified":
                raise serializers.ValidationError(
                    "Only Qualified Leads can be associated with a Deal."
                )

            return lead

        current_lead = getattr(
            self.instance,
            "lead",
            None
        )

        if (
            current_lead is not None
            and current_lead.id == lead.id
        ):
            return lead

        lead_status = str(
            getattr(lead, "lead_status", "")
        ).strip().lower()

        if lead_status != "qualified":
            raise serializers.ValidationError(
                "Only Qualified Leads can be associated with a Deal."
            )

        return lead

    # =====================================================
    # AMOUNT VALIDATION
    # =====================================================

    def validate_amount(self, value):

        if value is None:
            raise serializers.ValidationError(
                "Amount is required."
            )

        try:

            if value <= 0:
                raise serializers.ValidationError(
                    "Amount must be greater than 0."
                )

        except TypeError:

            raise serializers.ValidationError(
                "Enter a valid amount."
            )

        return value

    # =====================================================
    # STAGE VALIDATION
    # =====================================================

    def validate_stage(self, value):

        value = str(value).strip().lower()

        allowed_stages = {
            "new",
            "qualified",
            "proposal",
            "negotiation",
            "closed_won",
            "closed_lost",
        }

        if value not in allowed_stages:
            raise serializers.ValidationError(
                "Invalid Deal Stage."
            )

        return value

    # =====================================================
    # PRIORITY VALIDATION
    # =====================================================

    def validate_priority(self, value):

        value = str(value).strip().lower()

        allowed_priorities = {
            "low",
            "medium",
            "high",
        }

        if value not in allowed_priorities:
            raise serializers.ValidationError(
                "Invalid Priority."
            )

        return value

    # =====================================================
    # OWNER VALIDATION
    # =====================================================

    def validate_owner_ids(self, owners):

        if owners is not None and len(owners) == 0:
            raise serializers.ValidationError(
                "At least one Deal Owner is required."
            )

        return owners

    # =====================================================
    # CREATE
    # =====================================================

    def create(self, validated_data):

        owners = validated_data.pop(
            "owners",
            []
        )

        deal = Deal.objects.create(
            **validated_data
        )

        deal.owners.set(owners)

        return deal

    # =====================================================
    # UPDATE
    # =====================================================

    def update(self, instance, validated_data):

        owners = validated_data.pop(
            "owners",
            None
        )

        for attr, value in validated_data.items():

            setattr(
                instance,
                attr,
                value
            )

        instance.save()

        if owners is not None:
            instance.owners.set(owners)

        return instance