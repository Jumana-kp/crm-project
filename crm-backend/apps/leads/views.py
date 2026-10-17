
import csv
import io

from django.db import IntegrityError

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Lead, LeadStatus
from .serializers import LeadSerializer

from apps.users.models import User
from apps.companies.models import Company
from apps.products.models import Product
from apps.notifications.models import Notification


# =========================================================
# LEAD LIST + CREATE
# =========================================================

class LeadListCreateView(generics.ListCreateAPIView):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]

    search_fields = [
        "first_name",
        "last_name",
        "email",
        "phone_number",
        "city",
        "contact_owners__first_name",
        "contact_owners__last_name",
        "contact_owners__email",
    ]

    filterset_fields = [
        "lead_status",
    ]

    ordering_fields = [
        "first_name",
        "created_at",
        "updated_at",
    ]

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            queryset = Lead.objects.all()
        else:
            queryset = Lead.objects.filter(
                contact_owners=user
            ).distinct()

        created_date = self.request.query_params.get(
            "created_date"
        )

        if created_date:
            queryset = queryset.filter(
                created_at__date=created_date
            )

        return queryset

    def perform_create(self, serializer):
        """
        Create the lead first.

        After the lead is successfully created,
        create a notification for the user who
        performed the create operation.
        """

        lead = serializer.save()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"created a new lead: "
                f"{lead.first_name} {lead.last_name}"
            ),
        )


# =========================================================
# LEAD DETAIL
# =========================================================

class LeadDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = LeadSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            return Lead.objects.all()

        return Lead.objects.filter(
            contact_owners=user
        ).distinct()

    def perform_update(self, serializer):
        """
        Update the lead first.

        After the lead is successfully updated,
        create a notification for the user who
        performed the update operation.
        """

        lead = serializer.save()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"updated the lead: "
                f"{lead.first_name} {lead.last_name}"
            ),
        )

    def perform_destroy(self, instance):
        """
        Save the lead name before deleting it.

        Create the notification before deleting
        the lead so the lead name is available.
        """

        lead_name = (
            f"{instance.first_name} "
            f"{instance.last_name}"
        ).strip()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"deleted the lead: "
                f"{lead_name}"
            ),
        )

        instance.delete()


# =========================================================
# LEAD CSV IMPORT
# =========================================================

class LeadImportView(APIView):
    permission_classes = [IsAuthenticated]

    REQUIRED_COLUMNS = [
        "email",
        "first_name",
        "last_name",
        "country_code",
        "phone_number",
        "lead_status",
        "city",
    ]

    OPTIONAL_COLUMNS = [
        "job_title",
        "contact_owners",
        "company",
        "products",
    ]

    def post(self, request):
        uploaded_file = request.FILES.get("file")

        if not uploaded_file:
            return Response(
                {
                    "success": False,
                    "message": "Please upload a CSV file.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not uploaded_file.name.lower().endswith(".csv"):
            return Response(
                {
                    "success": False,
                    "message": "Only CSV files are supported.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            content = uploaded_file.read().decode(
                "utf-8-sig"
            )

            csv_file = io.StringIO(content)
            reader = csv.DictReader(csv_file)

        except UnicodeDecodeError:
            return Response(
                {
                    "success": False,
                    "message": (
                        "Unable to read the CSV file. "
                        "Please save it as UTF-8 CSV."
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not reader.fieldnames:
            return Response(
                {
                    "success": False,
                    "message": "CSV file does not contain headers.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        headers = [
            str(header).strip()
            for header in reader.fieldnames
            if header
        ]

        missing_columns = [
            column
            for column in self.REQUIRED_COLUMNS
            if column not in headers
        ]

        if missing_columns:
            return Response(
                {
                    "success": False,
                    "message": "Required CSV columns are missing.",
                    "missing_columns": missing_columns,
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        valid_statuses = {
            value
            for value, label in LeadStatus.choices
        }

        created = 0
        failed = 0
        errors = []

        for row_number, row in enumerate(
            reader,
            start=2
        ):
            clean_row = {}

            for key, value in row.items():
                if key is None:
                    continue

                clean_key = str(key).strip()

                if isinstance(value, str):
                    clean_value = value.strip()
                else:
                    clean_value = value

                clean_row[clean_key] = clean_value

            row_errors = []

            for field in self.REQUIRED_COLUMNS:
                value = clean_row.get(field)

                if value is None or str(value).strip() == "":
                    row_errors.append(
                        f"{field} is required."
                    )

            if row_errors:
                failed += 1

                errors.append(
                    {
                        "row": row_number,
                        "company_name": (
                            f"{clean_row.get('first_name', '')} "
                            f"{clean_row.get('last_name', '')}"
                        ).strip(),
                        "errors": row_errors,
                    }
                )

                continue

            email = clean_row.get("email")
            first_name = clean_row.get("first_name")
            last_name = clean_row.get("last_name")
            country_code = clean_row.get("country_code")
            phone_number = clean_row.get("phone_number")
            job_title = clean_row.get("job_title", "")
            lead_status = clean_row.get("lead_status")
            city = clean_row.get("city")

            if Lead.objects.filter(
                email__iexact=email
            ).exists():
                row_errors.append(
                    f"Email '{email}' already exists."
                )

            if lead_status not in valid_statuses:
                row_errors.append(
                    f"Invalid lead_status '{lead_status}'. "
                    f"Allowed values: "
                    f"{', '.join(sorted(valid_statuses))}."
                )

            if not str(phone_number).isdigit():
                row_errors.append(
                    "Phone number should contain only digits."
                )

            company = None

            company_value = clean_row.get("company")

            if company_value:
                try:
                    company = Company.objects.get(
                        company_name__iexact=company_value
                    )

                except Company.DoesNotExist:
                    row_errors.append(
                        f"Company '{company_value}' does not exist."
                    )

                except Company.MultipleObjectsReturned:
                    row_errors.append(
                        (
                            f"Multiple companies found with the "
                            f"name '{company_value}'. "
                            "Please use a unique company name."
                        )
                    )

            owners = []

            owner_value = clean_row.get(
                "contact_owners"
            )

            if owner_value:
                owner_values = [
                    value.strip()
                    for value in str(owner_value).split(";")
                    if value.strip()
                ]

                owner_ids = []

                for value in owner_values:
                    try:
                        owner_ids.append(
                            int(value)
                        )

                    except ValueError:
                        row_errors.append(
                            (
                                f"Invalid contact owner ID '{value}'. "
                                "Use existing User IDs separated by ';'."
                            )
                        )

                if owner_ids:
                    owners = list(
                        User.objects.filter(
                            id__in=owner_ids
                        )
                    )

                    found_ids = {
                        user.id
                        for user in owners
                    }

                    missing_ids = [
                        user_id
                        for user_id in owner_ids
                        if user_id not in found_ids
                    ]

                    if missing_ids:
                        row_errors.append(
                            (
                                "Contact owner IDs do not exist: "
                                + ", ".join(
                                    map(
                                        str,
                                        missing_ids
                                    )
                                )
                            )
                        )

            products = []

            product_value = clean_row.get(
                "products"
            )

            if product_value:
                product_values = [
                    value.strip()
                    for value in str(product_value).split(";")
                    if value.strip()
                ]

                product_ids = []

                for value in product_values:
                    try:
                        product_ids.append(
                            int(value)
                        )

                    except ValueError:
                        row_errors.append(
                            (
                                f"Invalid product ID '{value}'. "
                                "Use existing Product IDs separated by ';'."
                            )
                        )

                if product_ids:
                    products = list(
                        Product.objects.filter(
                            id__in=product_ids
                        )
                    )

                    found_ids = {
                        product.id
                        for product in products
                    }

                    missing_ids = [
                        product_id
                        for product_id in product_ids
                        if product_id not in found_ids
                    ]

                    if missing_ids:
                        row_errors.append(
                            (
                                "Product IDs do not exist: "
                                + ", ".join(
                                    map(
                                        str,
                                        missing_ids
                                    )
                                )
                            )
                        )

            if row_errors:
                failed += 1

                errors.append(
                    {
                        "row": row_number,
                        "company_name": (
                            f"{first_name} {last_name}"
                        ).strip(),
                        "errors": row_errors,
                    }
                )

                continue

            try:
                lead = Lead.objects.create(
                    email=email,
                    first_name=first_name,
                    last_name=last_name,
                    country_code=country_code,
                    phone_number=phone_number,
                    job_title=job_title,
                    city=city,
                    lead_status=lead_status,
                    company=company,
                )

                if owners:
                    lead.contact_owners.set(owners)
                else:
                    lead.contact_owners.add(request.user)

                if products:
                    lead.products.set(products)

                created += 1

            except IntegrityError:
                failed += 1

                errors.append(
                    {
                        "row": row_number,
                        "company_name": (
                            f"{first_name} {last_name}"
                        ).strip(),
                        "errors": [
                            (
                                "Lead could not be created because "
                                "a unique field already exists."
                            )
                        ],
                    }
                )

            except Exception as exc:
                failed += 1

                errors.append(
                    {
                        "row": row_number,
                        "company_name": (
                            f"{first_name} {last_name}"
                        ).strip(),
                        "errors": [
                            f"Unexpected error: {str(exc)}"
                        ],
                    }
                )

        return Response(
            {
                "success": failed == 0,
                "message": (
                    f"{created} lead(s) imported successfully."
                ),
                "created": created,
                "failed": failed,
                "total_rows": created + failed,
                "errors": errors,
            },
            status=status.HTTP_200_OK,
        )
