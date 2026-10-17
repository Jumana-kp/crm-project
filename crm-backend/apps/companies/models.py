from django.db import models
from apps.users.models import User
from django.core.validators import RegexValidator

# Create your models here.
class Company(models.Model):

    INDUSTRY_CHOICES = [
        ("IT", "Information Technology"),
        ("Healthcare", "Healthcare"),
        ("Retail", "Retail"),
        ("Finance", "Finance"),
        ("Education", "Education"),
        ("Manufacturing", "Manufacturing"),
        ("Agriculture", "Agriculture"),
        ("Other", "Other"),
    ]

    TYPE_CHOICES = [
        ("Private", "Private"),
        ("Public", "Public"),
        ("Startup", "Startup"),
        ("Government", "Government"),
        ("NGO", "NGO"),
        ("Partnership", "Partnership"),
    ]

    # Company Details
    domain_name = models.CharField(
        max_length=255,
        unique=True
    )

    company_name = models.CharField(
        max_length=255
    )

    # Multiple Company Owners
    company_owners = models.ManyToManyField(
        User,
        related_name="companies",
        blank=True
    )

    industry = models.CharField(
        max_length=50,
        choices=INDUSTRY_CHOICES
    )

    company_type = models.CharField(
        max_length=30,
        choices=TYPE_CHOICES
    )

    city = models.CharField(
        max_length=100
    )

    country = models.CharField(
        max_length=100
    )

    no_of_employees = models.PositiveIntegerField(
        null=True,
        blank=True
    )

    annual_revenue = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True
    )

    phone_number = models.CharField(
    max_length=20,
    validators=[
        RegexValidator(
            regex=r"^[0-9]+$",
            message="Phone number should contain only digits."
        )
      ]
    )

    email = models.EmailField(
        unique=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "companies"
        ordering = ["-created_at"]
        verbose_name_plural = "Companies"

    def __str__(self):
        return self.company_name