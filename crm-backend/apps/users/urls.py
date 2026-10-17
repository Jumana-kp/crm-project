from django.urls import path

from .views import (
    RegisterAPIView,
    LoginView,
    LogoutView,
    RequestResetPasswordAPIView,
    ResetPasswordAPIView,
    UserListAPIView,
)

urlpatterns = [

    path(
        "register/",
        RegisterAPIView.as_view(),
        name="register",
    ),

    path(
        "login/",
        LoginView.as_view(),
        name="login",
    ),

    path(
        "logout/",
        LogoutView.as_view(),
        name="logout",
    ),

    path(
        "request-reset-password/",
        RequestResetPasswordAPIView.as_view(),
        name="request_reset_password",
    ),

    path(
        "reset-password/",
        ResetPasswordAPIView.as_view(),
        name="reset_password",
    ),

    # NEW
    path(
        "",
        UserListAPIView.as_view(),
        name="user-list",
    ),
]