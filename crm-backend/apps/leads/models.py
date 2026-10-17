from django.db import models
from django.conf import settings
from django.core.validators import RegexValidator

# Create your models here.
class LeadStatus(models.TextChoices):
    NEW = "new", "New"
    CONTACTED = "contacted", "Contacted"
    QUALIFIED = "qualified", "Qualified"
    PROPOSAL_SENT = "proposal_sent", "Proposal Sent"
    NEGOTIATION = "negotiation", "Negotiation"
    CONVERTED = "converted", "Converted"
    LOST = "lost", "Lost"
    
    
class Lead(models.Model):
    
    email = models.EmailField(unique=True, db_index=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)

    country_code = models.CharField(max_length=10)
    phone_number = models.CharField(
        max_length=20,
        validators=[
            RegexValidator(
                regex=r"^[0-9]+$",
                message="Phone number should contain only digits."
            )
        ],
    )

    job_title = models.CharField(max_length=100, blank=True, default="")

    contact_owners = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="owned_leads",
        blank=True,
    )

    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="leads",
    )
    
    products = models.ManyToManyField(
        "products.Product",
        blank=True,
        related_name="leads",
    )

    lead_status = models.CharField(
        max_length=20,
        choices=LeadStatus.choices,
        default=LeadStatus.NEW,
        db_index=True,
    )

    city = models.CharField(max_length=100, db_index=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "leads"
        ordering = ["-created_at"]
        verbose_name = "Lead"
        verbose_name_plural = "Leads"

    def __str__(self):
        return f"{self.first_name} {self.last_name}"
