from django.contrib.auth import authenticate
from django.conf import settings
from django.core.mail import send_mail

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView

from rest_framework_simplejwt.tokens import RefreshToken

from .models import User

from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    LogoutSerializer,
    RequestResetPasswordSerializer,
    ResetPasswordSerializer,
)


# =========================================================
# REGISTER
# =========================================================

class RegisterAPIView(generics.CreateAPIView):

    permission_classes = [AllowAny]

    queryset = User.objects.all()

    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            {
                "message": "Registration successful",

                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                },
            },
            status=status.HTTP_201_CREATED
        )


# =========================================================
# LOGIN
# =========================================================

class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        email = request.data.get("email")
        password = request.data.get("password")

        user = authenticate(
            request,
            email=email,
            password=password
        )

        if user is None:

            return Response(
                {
                    "message": "Invalid email or password"
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                "message": "Login successful",

                "refresh": str(refresh),

                "access": str(
                    refresh.access_token
                ),

                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                },
            },
            status=status.HTTP_200_OK
        )


# =========================================================
# LOGOUT
# =========================================================

class LogoutView(generics.GenericAPIView):

    permission_classes = [AllowAny]

    serializer_class = LogoutSerializer

    def post(self, request):

        serializer = self.get_serializer(
            data=request.data
        )

        if serializer.is_valid():

            try:

                refresh_token = (
                    serializer.validated_data["refresh"]
                )

                token = RefreshToken(
                    refresh_token
                )

                token.blacklist()

                return Response(
                    {
                        "message": "Logout successful."
                    },
                    status=status.HTTP_200_OK,
                )

            except Exception:

                return Response(
                    {
                        "message": "Invalid refresh token."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# REQUEST RESET PASSWORD
# =========================================================

class RequestResetPasswordAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = (
            RequestResetPasswordSerializer(
                data=request.data
            )
        )

        if serializer.is_valid():

            user = serializer.validated_data["user"]

            reset_link = (
                f"http://localhost:3000/"
                f"reset-password?"
                f"token={user.reset_token}"
            )

            send_mail(
                subject="Reset Your Password",

                message=(
                    f"Hello {user.first_name},\n\n"
                    f"Click the link below to reset "
                    f"your password:\n\n"
                    f"{reset_link}"
                ),

                from_email=settings.EMAIL_HOST_USER,

                recipient_list=[
                    user.email
                ],

                fail_silently=False,
            )

            return Response(
                {
                    "message":
                        "Password reset link has "
                        "been generated successfully."
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )


# =========================================================
# RESET PASSWORD
# =========================================================

class ResetPasswordAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ResetPasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            user = serializer.validated_data["user"]

            password = (
                serializer.validated_data["password"]
            )

            user.set_password(password)

            # Clear reset token
            user.reset_token = None
            user.reset_token_expiry = None

            user.save()

            return Response(
                {
                    "message":
                        "Password reset successfully."
                },
                status=status.HTTP_200_OK,
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST,
        )
        
        # =========================================================
# USER LIST
# =========================================================

class UserListAPIView(generics.ListAPIView):

    permission_classes = [AllowAny]

    queryset = User.objects.all().order_by(
        "first_name"
    )

    def get(self, request, *args, **kwargs):

        users = self.get_queryset()

        return Response(
            [
                {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name,
                    "role": user.role,
                }
                for user in users
            ],
            status=status.HTTP_200_OK,
        )