
import csv
import io
from datetime import datetime, timedelta

from django.db import transaction
from django.db.models import Q

from rest_framework import generics, status
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Deal
from .serializers import DealSerializer
from apps.leads.models import Lead
from apps.users.models import User
from apps.notifications.models import Notification


# =========================================================
# CLOSE DATE HELPER
# =========================================================

def parse_close_date(value):
    """
    Supports:

    2026-09-15
    15-09-2026
    15/09/2026
    Excel serial dates such as 46280.
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
        OverflowError,
    ):
        raise ValueError(
            f"Invalid close_date '{value}'. "
            "Use YYYY-MM-DD format or a valid Excel date."
        )


# =========================================================
# DEAL LIST + CREATE
# =========================================================

class DealListCreateView(generics.ListCreateAPIView):
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [
        SearchFilter,
        OrderingFilter,
    ]

    search_fields = [
        "deal_name",
        "lead__first_name",
        "lead__last_name",
        "lead__email",
        "lead__phone_number",
        "lead__city",
        "lead__lead_status",
        "owners__first_name",
        "owners__last_name",
        "owners__email",
    ]

    ordering_fields = [
        "deal_name",
        "stage",
        "priority",
        "amount",
        "close_date",
        "created_at",
        "updated_at",
    ]

    ordering = ["-created_at"]

    def perform_create(self, serializer):
        """
        Create the deal first.

        After the deal is successfully created,
        create a notification for the user who
        performed the create operation.

        Existing qualified Lead -> Converted logic
        is preserved.
        """

        deal = serializer.save()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"created a new deal: "
                f"{deal.deal_name}"
            ),
        )

        lead = deal.lead

        if not lead:
            return

        lead_status = str(
            getattr(
                lead,
                "lead_status",
                ""
            )
        ).strip().lower()

        if lead_status == "qualified":
            lead.lead_status = "converted"

            lead.save(
                update_fields=["lead_status"]
            )

    def get_queryset(self):
        user = self.request.user

        if getattr(user, "role", None) == "admin":
            queryset = (
                Deal.objects
                .select_related("lead")
                .prefetch_related("owners")
                .all()
            )
        else:
            queryset = (
                Deal.objects
                .filter(owners=user)
                .select_related("lead")
                .prefetch_related("owners")
                .distinct()
            )

        owner_id = (
            self.request.query_params.get("owners")
            or self.request.query_params.get("owner")
            or self.request.query_params.get("owner_id")
        )

        if owner_id:
            try:
                queryset = queryset.filter(
                    owners__id=int(owner_id)
                ).distinct()
            except (ValueError, TypeError):
                queryset = queryset.none()

        stage = (
            self.request.query_params.get("stage")
            or ""
        ).strip().lower()

        if stage:
            queryset = queryset.filter(
                stage=stage
            )

        priority = (
            self.request.query_params.get("priority")
            or ""
        ).strip().lower()

        if priority:
            queryset = queryset.filter(
                priority=priority
            )

        close_date = (
            self.request.query_params.get("close_date")
            or ""
        ).strip()

        if close_date:
            queryset = queryset.filter(
                close_date=close_date
            )

        created_date = (
            self.request.query_params.get("created_date")
            or ""
        ).strip()

        if created_date:
            queryset = queryset.filter(
                created_at__date=created_date
            )

        return queryset


# =========================================================
# DEAL DETAIL
# =========================================================

class DealDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = DealSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if getattr(user, "role", None) == "admin":
            return (
                Deal.objects
                .select_related("lead")
                .prefetch_related("owners")
                .all()
            )

        return (
            Deal.objects
            .filter(owners=user)
            .select_related("lead")
            .prefetch_related("owners")
            .distinct()
        )

    def perform_update(self, serializer):
        """
        Update the deal first.

        After the deal is successfully updated,
        create a notification for the user who
        performed the update operation.
        """

        deal = serializer.save()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"updated the deal: "
                f"{deal.deal_name}"
            ),
        )

    def perform_destroy(self, instance):
        """
        Save the deal name before deleting it.

        Create the notification before deleting
        the deal so the deal name is available.
        """

        deal_name = (
            f"{instance.deal_name}"
        ).strip()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"deleted the deal: "
                f"{deal_name}"
            ),
        )

        instance.delete()


# =========================================================
# IMPORT DEAL CSV
# =========================================================

class ImportDealView(APIView):
    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser,
    ]

    def post(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {
                    "message": "CSV file is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not uploaded_file.name.lower().endswith(".csv"):
            return Response(
                {
                    "message": "Please upload a CSV file.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            raw_content = uploaded_file.read()

            try:
                decoded_file = raw_content.decode(
                    "utf-8-sig"
                )
            except UnicodeDecodeError:
                decoded_file = raw_content.decode("utf-8")

        except Exception as exc:
            return Response(
                {
                    "message": (
                        "Unable to read CSV file: "
                        f"{str(exc)}"
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        csv_file = io.StringIO(decoded_file)
        reader = csv.DictReader(csv_file)

        required_headers = [
            "deal_name",
            "lead_id",
            "owner_ids",
            "amount",
            "stage",
            "close_date",
            "priority",
        ]

        if not reader.fieldnames:
            return Response(
                {
                    "message": (
                        "CSV file must contain headers: "
                        + ", ".join(required_headers)
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        normalized_headers = []

        for header in reader.fieldnames:
            if header is None:
                continue

            normalized_headers.append(
                str(header).strip().lower()
            )

        reader.fieldnames = normalized_headers

        header_aliases = {
            "deal name": "deal_name",
            "name": "deal_name",
            "lead id": "lead_id",
            "lead": "lead_id",
            "owner ids": "owner_ids",
            "owner_id": "owner_ids",
            "owner": "owner_ids",
            "deal stage": "stage",
            "close date": "close_date",
        }

        canonical_headers = {
            header_aliases.get(
                header,
                header
            )
            for header in normalized_headers
        }

        missing_headers = [
            header
            for header in required_headers
            if header not in canonical_headers
        ]

        if missing_headers:
            return Response(
                {
                    "message": (
                        "Missing required column(s): "
                        + ", ".join(missing_headers)
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        created = 0
        failed = 0
        errors = []
        total_rows = 0

        valid_stages = {
            "new",
            "qualified",
            "proposal",
            "negotiation",
            "closed_won",
            "closed_lost",
        }

        valid_priorities = {
            "low",
            "medium",
            "high",
        }

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

                    normalized_key = str(
                        key
                    ).strip().lower()

                    canonical_key = header_aliases.get(
                        normalized_key,
                        normalized_key
                    )

                    normalized_value = (
                        str(value).strip()
                        if value is not None
                        else ""
                    )

                    normalized_row[
                        canonical_key
                    ] = normalized_value

                deal_name = (
                    normalized_row.get("deal_name")
                    or ""
                ).strip()

                if not deal_name:
                    raise ValueError(
                        "Deal name is required."
                    )

                if len(deal_name) < 3:
                    raise ValueError(
                        "Deal name must contain at least 3 characters."
                    )

                lead_id_value = (
                    normalized_row.get("lead_id")
                    or ""
                ).strip()

                if not lead_id_value:
                    raise ValueError(
                        "lead_id is required."
                    )

                try:
                    lead_id = int(
                        float(lead_id_value)
                    )
                except (
                    ValueError,
                    TypeError,
                ):
                    raise ValueError(
                        f"Invalid lead_id '{lead_id_value}'. "
                        "Use an existing Lead ID."
                    )

                try:
                    lead = Lead.objects.get(
                        id=lead_id
                    )
                except Lead.DoesNotExist:
                    raise ValueError(
                        f"Lead with ID {lead_id} does not exist."
                    )

                lead_status = str(
                    getattr(
                        lead,
                        "lead_status",
                        ""
                    )
                ).strip().lower()

                if lead_status != "qualified":
                    raise ValueError(
                        f"Lead #{lead.id} is not Qualified. "
                        "Only Qualified Leads can be associated "
                        "with a Deal."
                    )

                owner_ids_value = (
                    normalized_row.get("owner_ids")
                    or ""
                ).strip()

                if not owner_ids_value:
                    raise ValueError(
                        "At least one owner ID is required."
                    )

                raw_owner_ids = (
                    owner_ids_value
                    .replace(",", ";")
                    .split(";")
                )

                owner_ids = []

                for raw_owner_id in raw_owner_ids:
                    raw_owner_id = raw_owner_id.strip()

                    if not raw_owner_id:
                        continue

                    try:
                        owner_id = int(
                            float(raw_owner_id)
                        )
                    except (
                        ValueError,
                        TypeError,
                    ):
                        raise ValueError(
                            f"Invalid owner ID '{raw_owner_id}'."
                        )

                    owner_ids.append(owner_id)

                if not owner_ids:
                    raise ValueError(
                        "At least one owner ID is required."
                    )

                owner_ids = list(
                    dict.fromkeys(owner_ids)
                )

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

                amount_value = (
                    normalized_row.get("amount")
                    or ""
                ).strip()

                if not amount_value:
                    raise ValueError(
                        "Amount is required."
                    )

                try:
                    amount = float(
                        amount_value.replace(",", "")
                    )
                except (
                    ValueError,
                    TypeError,
                ):
                    raise ValueError(
                        f"Invalid amount '{amount_value}'."
                    )

                if amount <= 0:
                    raise ValueError(
                        "Amount must be greater than 0."
                    )

                stage = (
                    normalized_row.get("stage")
                    or ""
                ).strip().lower()

                if stage not in valid_stages:
                    raise ValueError(
                        f"Invalid stage '{stage}'. "
                        "Use new, qualified, proposal, "
                        "negotiation, closed_won, or closed_lost."
                    )

                priority = (
                    normalized_row.get("priority")
                    or ""
                ).strip().lower()

                if priority not in valid_priorities:
                    raise ValueError(
                        f"Invalid priority '{priority}'. "
                        "Use low, medium, or high."
                    )

                close_date_value = (
                    normalized_row.get("close_date")
                    or ""
                ).strip()

                if not close_date_value:
                    raise ValueError(
                        "Close date is required."
                    )

                close_date = parse_close_date(
                    close_date_value
                )

                if close_date is None:
                    raise ValueError(
                        "Close date is required."
                    )

                serializer_data = {
                    "deal_name": deal_name,
                    "lead_id": lead.id,
                    "owner_ids": owner_ids,
                    "amount": amount,
                    "stage": stage,
                    "priority": priority,
                    "close_date": close_date,
                }

                with transaction.atomic():
                    serializer = DealSerializer(
                        data=serializer_data,
                        context={
                            "request": request,
                        },
                    )

                    serializer.is_valid(
                        raise_exception=True
                    )

                    deal = serializer.save()

                    current_lead = deal.lead

                    if current_lead:
                        current_status = str(
                            getattr(
                                current_lead,
                                "lead_status",
                                ""
                            )
                        ).strip().lower()

                        if current_status == "qualified":
                            current_lead.lead_status = "converted"

                            current_lead.save(
                                update_fields=[
                                    "lead_status"
                                ]
                            )

                created += 1

            except Exception as exc:
                failed += 1

                error_message = str(exc)

                errors.append(
                    {
                        "row": row_number,
                        "deal_name": (
                            row.get("deal_name")
                            or row.get("deal name")
                            or ""
                        ).strip(),
                        "errors": [
                            error_message
                        ],
                    }
                )

        return Response(
            {
                "success": failed == 0,
                "message": (
                    "Deals imported successfully."
                    if failed == 0
                    else "Some deals could not be imported."
                ),
                "total_rows": total_rows,
                "created": created,
                "failed": failed,
                "errors": errors,
            },
            status=status.HTTP_200_OK,
        )

