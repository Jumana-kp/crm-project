from rest_framework import serializers

from .models import Call


class CallSerializer(serializers.ModelSerializer):

    # =========================================================
    # DISPLAY / READ-ONLY FIELDS
    # =========================================================

    created_by_name = serializers.SerializerMethodField()

    lead_name = serializers.SerializerMethodField()
    deal_name = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    ticket_name = serializers.SerializerMethodField()

    # =========================================================
    # META
    # =========================================================

    class Meta:
        model = Call

        fields = [
            "id",

            # -------------------------------------------------
            # USER
            # -------------------------------------------------

            "created_by",
            "created_by_name",

            # -------------------------------------------------
            # CRM RELATIONSHIPS
            # -------------------------------------------------

            "lead",
            "lead_name",

            "deal",
            "deal_name",

            "company",
            "company_name",

            "ticket",
            "ticket_name",

            # -------------------------------------------------
            # CALL DETAILS
            # -------------------------------------------------

            "call_outcome",
            "call_date",
            "call_time",
            "note",
            "duration",

            # -------------------------------------------------
            # TWILIO DETAILS
            # -------------------------------------------------

            "call_sid",
            "call_status",
            "started_at",
            "ended_at",

            # -------------------------------------------------
            # TIMESTAMPS
            # -------------------------------------------------

            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            # User
            "created_by",
            "created_by_name",

            # Display names
            "lead_name",
            "deal_name",
            "company_name",
            "ticket_name",

            # Twilio fields
            #
            # These should come from Twilio/backend,
            # not be manually entered by the user.
            "call_sid",
            "call_status",
            "started_at",
            "ended_at",

            # Timestamps
            "created_at",
            "updated_at",
        ]

    # =========================================================
    # CREATED BY
    # =========================================================

    def get_created_by_name(self, obj):

        if not obj.created_by:
            return None

        full_name = (
            f"{obj.created_by.first_name} "
            f"{obj.created_by.last_name}"
        ).strip()

        return full_name or obj.created_by.email

    # =========================================================
    # LEAD
    # =========================================================

    def get_lead_name(self, obj):

        if not obj.lead:
            return None

        return str(obj.lead)

    # =========================================================
    # DEAL
    # =========================================================

    def get_deal_name(self, obj):

        if not obj.deal:
            return None

        return str(obj.deal)

    # =========================================================
    # COMPANY
    # =========================================================

    def get_company_name(self, obj):

        if not obj.company:
            return None

        return str(obj.company)

    # =========================================================
    # TICKET
    # =========================================================

    def get_ticket_name(self, obj):

        if not obj.ticket:
            return None

        return str(obj.ticket)