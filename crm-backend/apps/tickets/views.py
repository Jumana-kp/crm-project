
import csv
import io

from datetime import datetime, timedelta

from django.db import transaction

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Ticket
from .serializers import TicketSerializer

from apps.users.models import User
from apps.deals.models import Deal
from apps.notifications.models import Notification


# =========================================================
# TICKET DATE HELPER
# =========================================================

def parse_ticket_date(value):
    """
    Parse a date value from common formats or an Excel serial date.

    Currently not required by the Ticket CSV import, but kept
    available for future date fields.
    """

    if value is None:
        return None

    value = str(value).strip()

    if not value:
        return None

    try:
        return datetime.strptime(
            value,
            "%Y-%m-%d"
        ).date()
    except ValueError:
        pass

    try:
        return datetime.strptime(
            value,
            "%d-%m-%Y"
        ).date()
    except ValueError:
        pass

    try:
        return datetime.strptime(
            value,
            "%d/%m/%Y"
        ).date()
    except ValueError:
        pass

    try:
        serial = float(value)

        if serial <= 0:
            raise ValueError

        excel_base_date = datetime(
            1899,
            12,
            30
        )

        return (
            excel_base_date
            + timedelta(days=serial)
        ).date()

    except (
        ValueError,
        OverflowError
    ):
        raise ValueError(
            f"Invalid date '{value}'."
        )


# =========================================================
# TICKET LIST + CREATE
# =========================================================

class TicketListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = TicketSerializer
    permission_classes = [
        IsAuthenticated
    ]

    search_fields = [
        "ticket_name",
        "description",
        "associated_deal__deal_name",
        "associated_deal__lead__first_name",
        "associated_deal__lead__last_name",
        "associated_deal__lead__email",
        "associated_deal__lead__phone_number",
        "associated_deal__lead__city",
        "ticket_owners__first_name",
        "ticket_owners__last_name",
        "ticket_owners__email",
    ]

    filterset_fields = [
        "ticket_status",
        "priority",
        "source",
        "associated_deal",
        "ticket_owners",
    ]

    ordering_fields = [
        "ticket_name",
        "created_at",
        "updated_at",
        "priority",
    ]

    ordering = [
        "-created_at"
    ]

    def perform_create(self, serializer):
        """
        Create the ticket first.

        After the ticket is successfully created,
        create a notification for the user who
        performed the create operation.
        """

        ticket = serializer.save()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"created a new ticket: "
                f"{ticket.ticket_name}"
            ),
        )

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Ticket.objects
            .select_related(
                "associated_deal",
                "associated_deal__lead",
            )
            .prefetch_related(
                "ticket_owners",
            )
        )

        if user.role != "admin":
            queryset = queryset.filter(
                ticket_owners=user
            ).distinct()

        created_date = self.request.query_params.get(
            "created_date"
        )

        if created_date:
            queryset = queryset.filter(
                created_at__date=created_date
            )

        return queryset


# =========================================================
# TICKET DETAIL
# =========================================================

class TicketDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = TicketSerializer
    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Ticket.objects
            .select_related(
                "associated_deal",
                "associated_deal__lead",
            )
            .prefetch_related(
                "ticket_owners",
            )
        )

        if user.role == "admin":
            return queryset

        return queryset.filter(
            ticket_owners=user
        ).distinct()

    def perform_update(self, serializer):
        """
        Update the ticket first.

        After the ticket is successfully updated,
        create a notification for the user who
        performed the update operation.
        """

        ticket = serializer.save()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"updated the ticket: "
                f"{ticket.ticket_name}"
            ),
        )

    def perform_destroy(self, instance):
        """
        Save the ticket name before deleting it.

        Create the notification before deleting
        the ticket so the ticket name is available.
        """

        ticket_name = (
            f"{instance.ticket_name}"
        ).strip()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"deleted the ticket: "
                f"{ticket_name}"
            ),
        )

        instance.delete()


# =========================================================
# IMPORT TICKET CSV
# =========================================================

class ImportTicketView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        uploaded_file = request.FILES.get(
            "file"
        )

        if not uploaded_file:
            return Response(
                {
                    "message": "CSV file is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if not uploaded_file.name.lower().endswith(
            ".csv"
        ):
            return Response(
                {
                    "message": "Please upload a CSV file."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            raw_content = uploaded_file.read()

            try:
                decoded_file = raw_content.decode(
                    "utf-8-sig"
                )
            except UnicodeDecodeError:
                decoded_file = raw_content.decode(
                    "utf-8"
                )

        except Exception as exc:
            return Response(
                {
                    "message": (
                        "Unable to read CSV file: "
                        f"{str(exc)}"
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        csv_file = io.StringIO(
            decoded_file
        )

        reader = csv.DictReader(
            csv_file
        )

        required_headers = [
            "ticket_name",
            "description",
            "ticket_status",
            "source",
            "priority",
            "associated_deal_id",
        ]

        if not reader.fieldnames:
            return Response(
                {
                    "message": (
                        "CSV file must contain headers: "
                        + ", ".join(required_headers)
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        reader.fieldnames = [
            str(header).strip().lower()
            for header in reader.fieldnames
            if header
        ]

        headers = set(
            reader.fieldnames
        )

        missing_headers = [
            header
            for header in required_headers
            if header not in headers
        ]

        if missing_headers:
            return Response(
                {
                    "message": (
                        "Missing required column(s): "
                        + ", ".join(missing_headers)
                    )
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        created = 0
        failed = 0
        total_rows = 0
        errors = []

        for row_number, row in enumerate(
            reader,
            start=2
        ):

            total_rows += 1

            try:
                normalized_row = {}

                for key, value in row.items():

                    if key is None:
                        continue

                    normalized_key = (
                        str(key)
                        .strip()
                        .lower()
                    )

                    normalized_value = (
                        str(value).strip()
                        if value is not None
                        else ""
                    )

                    normalized_row[
                        normalized_key
                    ] = normalized_value

                ticket_name = (
                    normalized_row.get(
                        "ticket_name"
                    )
                    or normalized_row.get(
                        "ticket name"
                    )
                    or ""
                ).strip()

                if not ticket_name:
                    raise ValueError(
                        "Ticket name is required."
                    )

                description = (
                    normalized_row.get(
                        "description"
                    )
                    or ""
                ).strip()

                ticket_status = (
                    normalized_row.get(
                        "ticket_status"
                    )
                    or normalized_row.get(
                        "status"
                    )
                    or ""
                ).strip()

                if not ticket_status:
                    raise ValueError(
                        "ticket_status is required."
                    )

                source = (
                    normalized_row.get(
                        "source"
                    )
                    or ""
                ).strip()

                if not source:
                    raise ValueError(
                        "source is required."
                    )

                priority = (
                    normalized_row.get(
                        "priority"
                    )
                    or ""
                ).strip()

                if not priority:
                    raise ValueError(
                        "priority is required."
                    )

                associated_deal_id_value = (
                    normalized_row.get(
                        "associated_deal_id"
                    )
                    or normalized_row.get(
                        "associated deal id"
                    )
                    or normalized_row.get(
                        "deal_id"
                    )
                    or ""
                ).strip()

                if not associated_deal_id_value:
                    raise ValueError(
                        "associated_deal_id is required."
                    )

                try:
                    associated_deal_id = int(
                        float(
                            associated_deal_id_value
                        )
                    )
                except (
                    ValueError,
                    TypeError
                ):
                    raise ValueError(
                        f"Invalid associated_deal_id "
                        f"'{associated_deal_id_value}'."
                    )

                try:
                    associated_deal = (
                        Deal.objects
                        .select_related("lead")
                        .get(
                            id=associated_deal_id
                        )
                    )
                except Deal.DoesNotExist:
                    raise ValueError(
                        f"Deal with ID "
                        f"{associated_deal_id} "
                        f"does not exist."
                    )

                owner_ids_value = (
                    normalized_row.get(
                        "ticket_owner_ids"
                    )
                    or normalized_row.get(
                        "ticket owner ids"
                    )
                    or normalized_row.get(
                        "owner_ids"
                    )
                    or normalized_row.get(
                        "owner_id"
                    )
                    or ""
                ).strip()

                owner_ids = []

                if owner_ids_value:

                    raw_owner_ids = (
                        owner_ids_value
                        .replace(",", ";")
                        .split(";")
                    )

                    for raw_owner_id in raw_owner_ids:

                        raw_owner_id = (
                            raw_owner_id.strip()
                        )

                        if not raw_owner_id:
                            continue

                        try:
                            owner_id = int(
                                float(
                                    raw_owner_id
                                )
                            )
                        except (
                            ValueError,
                            TypeError
                        ):
                            raise ValueError(
                                f"Invalid owner ID "
                                f"'{raw_owner_id}'."
                            )

                        owner_ids.append(
                            owner_id
                        )

                owners = []

                if owner_ids:

                    owners = list(
                        User.objects.filter(
                            id__in=owner_ids
                        )
                    )

                    found_owner_ids = {
                        owner.id
                        for owner in owners
                    }

                    missing_owner_ids = [
                        owner_id
                        for owner_id in owner_ids
                        if owner_id not in found_owner_ids
                    ]

                    if missing_owner_ids:
                        raise ValueError(
                            "User ID(s) not found: "
                            + ", ".join(
                                map(
                                    str,
                                    missing_owner_ids
                                )
                            )
                        )

                serializer_data = {
                    "ticket_name": ticket_name,
                    "description": description,
                    "ticket_status": ticket_status,
                    "source": source,
                    "priority": priority,
                    "associated_deal_id": associated_deal.id,
                }

                if owner_ids:
                    serializer_data[
                        "ticket_owner_ids"
                    ] = owner_ids

                serializer = TicketSerializer(
                    data=serializer_data,
                    context={
                        "request": request
                    }
                )

                serializer.is_valid(
                    raise_exception=True
                )

                with transaction.atomic():
                    serializer.save()

                created += 1

            except Exception as exc:

                failed += 1

                if hasattr(exc, "detail"):

                    detail = exc.detail

                    if isinstance(detail, dict):

                        formatted_errors = {}

                        for field, value in detail.items():

                            if isinstance(
                                value,
                                list
                            ):
                                formatted_errors[
                                    field
                                ] = [
                                    str(item)
                                    for item in value
                                ]
                            else:
                                formatted_errors[
                                    field
                                ] = str(value)

                    elif isinstance(
                        detail,
                        list
                    ):
                        formatted_errors = [
                            str(item)
                            for item in detail
                        ]

                    else:
                        formatted_errors = str(
                            detail
                        )

                else:
                    formatted_errors = [
                        str(exc)
                    ]

                errors.append(
                    {
                        "row": row_number,
                        "ticket_name": (
                            normalized_row.get(
                                "ticket_name",
                                ""
                            )
                            if "normalized_row" in locals()
                            else ""
                        ),
                        "errors": formatted_errors,
                    }
                )

        return Response(
            {
                "success": failed == 0,
                "message": (
                    "Tickets imported successfully."
                    if failed == 0
                    else "Some tickets could not be imported."
                ),
                "total_rows": total_rows,
                "created": created,
                "failed": failed,
                "errors": errors,
            },
            status=status.HTTP_200_OK
        )

