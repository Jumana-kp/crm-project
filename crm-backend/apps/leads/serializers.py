from rest_framework import serializers

from .models import Lead
from apps.users.models import User
from apps.companies.models import Company
from apps.products.models import Product


class UserNestedSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = (
            "id",
            "first_name",
            "last_name",
            "email",
        )


class CompanyNestedSerializer(serializers.ModelSerializer):

    class Meta:
        model = Company
        fields = (
            "id",
            "company_name",
            "email",
        )


class ProductNestedSerializer(serializers.ModelSerializer):

    class Meta:
        model = Product
        fields = (
            "id",
            "name",
            "sku",
            "price",
        )


class LeadSerializer(serializers.ModelSerializer):



    contact_owners = UserNestedSerializer(
        many=True,
        read_only=True
    )

    company = CompanyNestedSerializer(
        read_only=True
    )

    products = ProductNestedSerializer(
        many=True,
        read_only=True
    )


    contact_owner_ids = serializers.PrimaryKeyRelatedField(
        source="contact_owners",
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        required=False
    )

    company_id = serializers.PrimaryKeyRelatedField(
        source="company",
        queryset=Company.objects.all(),
        write_only=True,
        required=False,
        allow_null=True
    )

    product_ids = serializers.PrimaryKeyRelatedField(
        source="products",
        queryset=Product.objects.all(),
        many=True,
        write_only=True,
        required=False
    )


    class Meta:
        model = Lead
        fields = "__all__"