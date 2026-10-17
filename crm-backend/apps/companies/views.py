
import csv
import io
from decimal import Decimal, InvalidOperation

from django.db import IntegrityError

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Company
from .serializers import CompanySerializer

from apps.users.models import User
from apps.notifications.models import Notification


# =========================================================
# COMPANY LIST + CREATE
# =========================================================

class CompanyListCreateView(generics.ListCreateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    search_fields = [
        "company_name",
        "phone_number",
        "email",
        "domain_name",
        "city",
        "country",
        "company_owners__first_name",
        "company_owners__last_name",
        "company_owners__email",
    ]

    filterset_fields = [
        "industry",
        "city",
        "country",
    ]

    ordering_fields = [
        "company_name",
        "created_at",
        "updated_at",
        "annual_revenue",
        "no_of_employees",
    ]

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            queryset = Company.objects.all()
        else:
            queryset = Company.objects.filter(
                company_owners=user
            ).distinct()

        created_date = self.request.query_params.get("created_date")

        if created_date:
            queryset = queryset.filter(
                created_at__date=created_date
            )

        lead_status = self.request.query_params.get("lead_status")

        if lead_status:
            queryset = queryset.filter(
                leads__lead_status=lead_status
            ).distinct()

        return queryset

    def perform_create(self, serializer):
        """
        Create the company first.

        After the company is successfully created,
        create a notification for the user who
        performed the create operation.
        """

        company = serializer.save()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"created a new company: "
                f"{company.company_name}"
            ),
        )


# =========================================================
# COMPANY DETAIL
# =========================================================

class CompanyDetailView(
    generics.RetrieveUpdateDestroyAPIView
):
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "admin":
            return Company.objects.all()

        return Company.objects.filter(
            company_owners=user
        ).distinct()

    def perform_update(self, serializer):
        """
        Update the company first.

        After the company is successfully updated,
        create a notification for the user who
        performed the update operation.
        """

        company = serializer.save()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"updated the company: "
                f"{company.company_name}"
            ),
        )

    def perform_destroy(self, instance):
        """
        Save the company name before deleting it.

        Create the notification before deleting
        the company so the company name is available.
        """

        company_name = (
            f"{instance.company_name}"
        ).strip()

        Notification.objects.create(
            user=self.request.user,
            message=(
                f"{self.request.user.first_name} "
                f"{self.request.user.last_name} "
                f"deleted the company: "
                f"{company_name}"
            ),
        )

        instance.delete()


# =========================================================
# COMPANY CSV IMPORT
# =========================================================

class CompanyImportView(APIView):
    permission_classes = [IsAuthenticated]

    REQUIRED_COLUMNS = [
        "domain_name",
        "company_name",
        "industry",
        "company_type",
        "city",
        "country",
        "phone_number",
        "email",
    ]

    OPTIONAL_COLUMNS = [
        "no_of_employees",
        "annual_revenue",
        "company_owner_ids",
    ]

    def normalize_phone(self, value):
        if value is None:
            return ""

        value = str(value).strip()

        if not value:
            return ""

        if value.isdigit():
            return value

        value_without_spaces = value.replace(" ", "")

        if value_without_spaces.isdigit():
            return value_without_spaces

        try:
            decimal_value = Decimal(value_without_spaces)

            if decimal_value == decimal_value.to_integral_value():
                return str(int(decimal_value))

        except (
            InvalidOperation,
            ValueError,
            TypeError,
        ):
            pass

        return value

    def get_company_owners(self, owner_ids_value):
        if owner_ids_value is None:
            return [], []

        owner_ids_value = str(owner_ids_value).strip()

        if not owner_ids_value:
            return [], []

        normalized = owner_ids_value.replace(";", ",")

        raw_ids = [
            value.strip()
            for value in normalized.split(",")
            if value.strip()
        ]

        if not raw_ids:
            return [], []

        owner_ids = []
        errors = []

        for raw_id in raw_ids:
            try:
                owner_id = int(raw_id)

                if owner_id <= 0:
                    raise ValueError

                owner_ids.append(owner_id)

            except (ValueError, TypeError):
                errors.append(
                    f"Invalid company owner ID '{raw_id}'. "
                    "Owner IDs must be positive numbers."
                )

        if errors:
            return [], errors

        owner_ids = list(dict.fromkeys(owner_ids))

        owners = list(
            User.objects.filter(id__in=owner_ids)
        )

        found_ids = {
            user.id
            for user in owners
        }

        missing_ids = [
            owner_id
            for owner_id in owner_ids
            if owner_id not in found_ids
        ]

        if missing_ids:
            errors.append(
                "Company owner IDs do not exist: "
                + ", ".join(map(str, missing_ids))
            )

        return owners, errors

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
            decoded_file = uploaded_file.read().decode(
                "utf-8-sig"
            )

            csv_file = io.StringIO(decoded_file)

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

        original_headers = reader.fieldnames

        cleaned_headers = [
            header.strip() if header else ""
            for header in original_headers
        ]

        reader.fieldnames = cleaned_headers

        headers = [
            header
            for header in cleaned_headers
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

        valid_industries = {
            value
            for value, label in Company.INDUSTRY_CHOICES
        }

        valid_company_types = {
            value
            for value, label in Company.TYPE_CHOICES
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
                if not key:
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

                if value is None or not str(value).strip():
                    row_errors.append(
                        f"{field} is required."
                    )

            if row_errors:
                failed += 1

                errors.append(
                    {
                        "row": row_number,
                        "company_name": clean_row.get(
                            "company_name",
                            "",
                        ),
                        "errors": row_errors,
                    }
                )

                continue

            domain_name = str(
                clean_row.get("domain_name")
            ).strip()

            company_name = str(
                clean_row.get("company_name")
            ).strip()

            industry = str(
                clean_row.get("industry")
            ).strip()

            company_type = str(
                clean_row.get("company_type")
            ).strip()

            city = str(
                clean_row.get("city")
            ).strip()

            country = str(
                clean_row.get("country")
            ).strip()

            email = str(
                clean_row.get("email")
            ).strip()

            phone_number = self.normalize_phone(
                clean_row.get("phone_number")
            )

            if Company.objects.filter(
                domain_name=domain_name
            ).exists():
                row_errors.append(
                    f"Domain '{domain_name}' already exists."
                )

            if Company.objects.filter(
                email=email
            ).exists():
                row_errors.append(
                    f"Email '{email}' already exists."
                )

            if industry not in valid_industries:
                row_errors.append(
                    f"Invalid industry '{industry}'. "
                    "Allowed values: "
                    f"{', '.join(sorted(valid_industries))}."
                )

            if company_type not in valid_company_types:
                row_errors.append(
                    f"Invalid company_type '{company_type}'. "
                    "Allowed values: "
                    f"{', '.join(sorted(valid_company_types))}."
                )

            if not phone_number:
                row_errors.append(
                    "Phone number is required."
                )
            elif not phone_number.isdigit():
                row_errors.append(
                    "Phone number should contain only digits."
                )

            no_of_employees = clean_row.get(
                "no_of_employees"
            )

            if (
                no_of_employees is not None
                and str(no_of_employees).strip()
            ):
                try:
                    no_of_employees = int(
                        str(no_of_employees).strip()
                    )

                    if no_of_employees < 0:
                        raise ValueError

                except (ValueError, TypeError):
                    row_errors.append(
                        "no_of_employees must be a positive integer."
                    )

                    no_of_employees = None
            else:
                no_of_employees = None

            annual_revenue = clean_row.get(
                "annual_revenue"
            )

            if (
                annual_revenue is not None
                and str(annual_revenue).strip()
            ):
                try:
                    annual_revenue = Decimal(
                        str(annual_revenue).strip()
                    )

                    if annual_revenue < 0:
                        raise ValueError

                except (
                    InvalidOperation,
                    ValueError,
                    TypeError,
                ):
                    row_errors.append(
                        "annual_revenue must be a valid number."
                    )

                    annual_revenue = None
            else:
                annual_revenue = None

            owner_ids_value = clean_row.get(
                "company_owner_ids"
            )

            owners, owner_errors = self.get_company_owners(
                owner_ids_value
            )

            row_errors.extend(owner_errors)

            if row_errors:
                failed += 1

                errors.append(
                    {
                        "row": row_number,
                        "company_name": company_name,
                        "errors": row_errors,
                    }
                )

                continue

            try:
                company = Company.objects.create(
                    domain_name=domain_name,
                    company_name=company_name,
                    industry=industry,
                    company_type=company_type,
                    city=city,
                    country=country,
                    no_of_employees=no_of_employees,
                    annual_revenue=annual_revenue,
                    phone_number=phone_number,
                    email=email,
                )

                if owners:
                    company.company_owners.set(owners)
                else:
                    company.company_owners.add(request.user)

                created += 1

            except IntegrityError:
                failed += 1

                errors.append(
                    {
                        "row": row_number,
                        "company_name": company_name,
                        "errors": [
                            (
                                "Company could not be created "
                                "because a unique field already exists."
                            )
                        ],
                    }
                )

        return Response(
            {
                "success": failed == 0,
                "message": (
                    f"{created} company(s) "
                    "imported successfully."
                ),
                "created": created,
                "failed": failed,
                "total_rows": created + failed,
                "errors": errors,
            },
            status=status.HTTP_200_OK,
        )

