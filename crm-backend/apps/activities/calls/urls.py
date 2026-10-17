from django.urls import path

from .views import (
    CallListCreateView,
    CallDetailView,
    TwilioCallView,
    TwilioVoiceView,
    TwilioCallWebhookView,
)


urlpatterns = [

    # =====================================================
    # CRM CALLS
    # =====================================================

    path(
        "",
        CallListCreateView.as_view(),
        name="call-list-create",
    ),

    path(
        "<int:pk>/",
        CallDetailView.as_view(),
        name="call-detail",
    ),

    # =====================================================
    # TWILIO
    # =====================================================

    path(
        "twilio/",
        TwilioCallView.as_view(),
        name="twilio-call",
    ),

    path(
        "twilio/voice/",
        TwilioVoiceView.as_view(),
        name="twilio-voice",
    ),

    path(
        "twilio/webhook/",
        TwilioCallWebhookView.as_view(),
        name="twilio-webhook",
    ),
]