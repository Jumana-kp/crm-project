from rest_framework import serializers
from .models import User
from django.contrib.auth import authenticate
from rest_framework import serializers

import uuid
from datetime import timedelta
from django.utils import timezone

# Registration
class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    

    class Meta:
        model = User
        fields = [
            "email",
            "password",
            "confirm_password",
            "first_name",
            "last_name",
            "phone_number",
            "country",
            "industry_type",
            "company_name",
            "role",
        ]
        
    def validate(self, attrs):
        if attrs["password"] != attrs["confirm_password"]:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )
        return attrs 

    def create(self, validated_data):
        
        password = validated_data.pop("password")
        validated_data.pop("confirm_password")

        user = User(**validated_data)
        user.set_password(password)
        user.save()

        return user
    
    # Login
    
class LoginSerializer(serializers.Serializer):
    
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email")
        password = attrs.get("password")

        user = authenticate(username=email, password=password)

        if user is None:
            raise serializers.ValidationError(
                {"message": "Invalid email or password."}
            )

        attrs["user"] = user
        return attrs
    
    # Logout
    
class LogoutSerializer(serializers.Serializer):
    
    refresh = serializers.CharField()
    
# Request rest Password    # 
    
class RequestResetPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        email = attrs.get("email")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {"message": "User with this email does not exist."}
            )

        # Generate reset token
        user.reset_token = uuid.uuid4()

        # Set token expiry (15 minutes)
        user.reset_token_expiry = timezone.now() + timedelta(minutes=15)

        # Save the changes
        user.save()

        # Pass user to the view
        attrs["user"] = user

        return attrs
    
    
# Reset Password    # 

class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.UUIDField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        token = attrs.get("token")
        password = attrs.get("password")
        confirm_password = attrs.get("confirm_password")

        # Check password match
        if password != confirm_password:
            raise serializers.ValidationError(
                {
                    "confirm_password": "Passwords do not match."
                }
            )

        # Check token
        try:
            user = User.objects.get(reset_token=token)
        except User.DoesNotExist:
            raise serializers.ValidationError(
                {
                    "message": "Invalid reset token."
                }
            )

        # Check expiry
        if (
            user.reset_token_expiry is None
            or user.reset_token_expiry < timezone.now()
        ):
            raise serializers.ValidationError(
                {
                    "message": "Reset token has expired."
                }
            )

        attrs["user"] = user

        return attrs

