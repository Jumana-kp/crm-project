from rest_framework import serializers

from .models import Ticket
from apps.users.models import User
from apps.deals.models import Deal
from apps.leads.models import Lead


class UserNestedSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )


class LeadNestedSerializer(serializers.ModelSerializer):

    class Meta:
        model = Lead
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
            "country_code",
            "phone_number",
            "city",
        )


class DealNestedSerializer(serializers.ModelSerializer):

    lead = LeadNestedSerializer(
        read_only=True
    )

    class Meta:
        model = Deal
        fields = (
            "id",
            "deal_name",
            "lead",
        )


class TicketSerializer(serializers.ModelSerializer):

    ticket_owners = UserNestedSerializer(
        many=True,
        read_only=True
    )

    associated_deal = DealNestedSerializer(
        read_only=True
    )

    ticket_owner_ids = serializers.PrimaryKeyRelatedField(
        source="ticket_owners",
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    associated_deal_id = serializers.PrimaryKeyRelatedField(
        source="associated_deal",
        queryset=Deal.objects.all(),
        write_only=True,
        required=True,
        allow_null=False
    )

    class Meta:
        model = Ticket

        fields = [
            "id",
            "ticket_name",
            "description",
            "ticket_status",
            "source",
            "priority",
            "ticket_owners",
            "ticket_owner_ids",
            "associated_deal",
            "associated_deal_id",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "ticket_owners",
            "associated_deal",
            "created_at",
            "updated_at",
        ]

    def validate_ticket_name(self, value):
        value = str(value).strip()

        if not value:
            raise serializers.ValidationError(
                "Ticket name is required."
            )

        if len(value) < 3:
            raise serializers.ValidationError(
                "Ticket name must contain at least 3 characters."
            )

        return value

    def validate_description(self, value):
        if value is None:
            return ""

        return str(value).strip()

    def validate_ticket_status(self, value):
        value = str(value).strip()

        valid_statuses = {
            "Open",
            "In Progress",
            "On Hold",
            "Resolved",
            "Closed",
        }

        normalized_status = {
            status.lower(): status
            for status in valid_statuses
        }

        if value.lower() not in normalized_status:
            raise serializers.ValidationError(
                "Invalid ticket status. "
                "Use Open, In Progress, On Hold, Resolved, or Closed."
            )

        return normalized_status[value.lower()]

    def validate_source(self, value):
        value = str(value).strip()

        valid_sources = {
            "Email",
            "Phone",
            "Website",
            "Chat",
            "Other",
        }

        normalized_sources = {
            source.lower(): source
            for source in valid_sources
        }

        if value.lower() not in normalized_sources:
            raise serializers.ValidationError(
                "Invalid ticket source. "
                "Use Email, Phone, Website, Chat, or Other."
            )

        return normalized_sources[value.lower()]

    def validate_priority(self, value):
        value = str(value).strip()

        valid_priorities = {
            "Low",
            "Medium",
            "High",
            "Urgent",
        }

        normalized_priorities = {
            priority.lower(): priority
            for priority in valid_priorities
        }

        if value.lower() not in normalized_priorities:
            raise serializers.ValidationError(
                "Invalid ticket priority. "
                "Use Low, Medium, High, or Urgent."
            )

        return normalized_priorities[value.lower()]

    def validate_associated_deal_id(self, deal):
        if deal is None:
            raise serializers.ValidationError(
                "Associated Deal is required."
            )

        return deal

    def create(self, validated_data):
        owners = validated_data.pop(
            "ticket_owners",
            []
        )

        if not validated_data.get("associated_deal"):
            raise serializers.ValidationError({
                "associated_deal_id": [
                    "Associated Deal is required."
                ]
            })

        ticket = Ticket.objects.create(
            **validated_data
        )

        ticket.ticket_owners.set(
            owners
        )

        return ticket

    def update(self, instance, validated_data):
        owners = validated_data.pop(
            "ticket_owners",
            None
        )

        if (
            "associated_deal" in validated_data
            and validated_data["associated_deal"] is None
        ):
            raise serializers.ValidationError({
                "associated_deal_id": [
                    "Associated Deal is required."
                ]
            })

        for attr, value in validated_data.items():
            setattr(
                instance,
                attr,
                value
            )

        instance.save()

        if owners is not None:
            instance.ticket_owners.set(
                owners
            )

        return instance