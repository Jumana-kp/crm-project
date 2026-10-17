from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

try:
    from twilio.rest import Client
    from twilio.twiml.voice_response import VoiceResponse
except (ImportError, ModuleNotFoundError):
    Client = None
    VoiceResponse = None

from .models import Call
from .serializers import CallSerializer


# =========================================================
# CALL LIST + CREATE
# =========================================================

class CallListCreateView(generics.ListCreateAPIView):

    serializer_class = CallSerializer
    permission_classes = [IsAuthenticated]

    search_fields = [
        "note",
        "lead__first_name",
        "lead__last_name",
        "lead__email",
        "deal__deal_name",
        "company__company_name",
        "ticket__ticket_name",
    ]

    filterset_fields = [
        "call_outcome",
        "lead",
        "deal",
        "company",
        "ticket",
        "created_by",
        "call_date",
        "call_status",
    ]

    ordering_fields = [
        "call_date",
        "call_time",
        "duration",
        "created_at",
        "updated_at",
    ]

    ordering = [
        "-call_date",
        "-call_time",
    ]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Call.objects
            .select_related(
                "created_by",
                "lead",
                "deal",
                "company",
                "ticket",
            )
        )

        if getattr(user, "role", None) == "admin":
            return queryset

        return queryset.filter(
            created_by=user
        )

    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )


# =========================================================
# CALL DETAIL / UPDATE / DELETE
# =========================================================

class CallDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = CallSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Call.objects
            .select_related(
                "created_by",
                "lead",
                "deal",
                "company",
                "ticket",
            )
        )

        if getattr(user, "role", None) == "admin":
            return queryset

        return queryset.filter(
            created_by=user
        )


# =========================================================
# TWILIO WEBHOOK BASE URL
# =========================================================

def get_twilio_webhook_base_url():

    base_url = getattr(
        settings,
        "TWILIO_WEBHOOK_BASE_URL",
        "",
    )

    if not base_url:
        return None

    return str(
        base_url
    ).strip().rstrip("/")


# =========================================================
# TWILIO CALL
# =========================================================

class TwilioCallView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        # =====================================================
        # PHONE NUMBER
        # =====================================================

        phone_number = (
            request.data.get("phone_number")
            or ""
        ).strip()

        if not phone_number:

            return Response(
                {
                    "success": False,
                    "message": "phone_number is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        # =====================================================
        # CRM RELATIONSHIPS
        # =====================================================

        lead_id = request.data.get("lead")
        deal_id = request.data.get("deal")
        company_id = request.data.get("company")
        ticket_id = request.data.get("ticket")

        # =====================================================
        # TWILIO SETTINGS
        # =====================================================

        account_sid = getattr(
            settings,
            "TWILIO_ACCOUNT_SID",
            "",
        )

        auth_token = getattr(
            settings,
            "TWILIO_AUTH_TOKEN",
            "",
        )

        twilio_phone_number = getattr(
            settings,
            "TWILIO_PHONE_NUMBER",
            "",
        )

        webhook_base_url = (
            get_twilio_webhook_base_url()
        )

        # =====================================================
        # CLEAN VALUES
        # =====================================================

        account_sid = str(
            account_sid or ""
        ).strip()

        auth_token = str(
            auth_token or ""
        ).strip()

        twilio_phone_number = str(
            twilio_phone_number or ""
        ).strip()

        # =====================================================
        # VALIDATE TWILIO CONFIGURATION
        # =====================================================

        if not account_sid:

            return Response(
                {
                    "success": False,
                    "message": (
                        "Calling is not configured on this environment."
                    ),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not auth_token:

            return Response(
                {
                    "success": False,
                    "message": (
                        "Calling is not configured on this environment."
                    ),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if not twilio_phone_number:

            return Response(
                {
                    "success": False,
                    "message": (
                        "Calling is not configured on this environment."
                    ),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        if Client is None:

            return Response(
                {
                    "success": False,
                    "message": (
                        "Calling is not available because "
                        "the Twilio package is not installed."
                    ),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        # =====================================================
        # WEBHOOK URL
        # =====================================================

        if not webhook_base_url:

            return Response(
                {
                    "success": False,
                    "message": (
                        "Calling is not configured on this environment."
                    ),
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        voice_url = (
            f"{webhook_base_url}"
            "/api/v1/calls/twilio/voice/"
        )

        status_callback_url = (
            f"{webhook_base_url}"
            "/api/v1/calls/twilio/webhook/"
        )

        # =====================================================
        # CREATE TWILIO CLIENT + CALL
        # =====================================================

        try:

            client = Client(
                account_sid,
                auth_token,
            )

            twilio_call = client.calls.create(
                to=phone_number,
                from_=twilio_phone_number,
                url=voice_url,
                status_callback=status_callback_url,
            )

            # =================================================
            # CREATE ONE CRM CALL RECORD
            # =================================================

            now = timezone.now()

            call_record = Call.objects.create(

                created_by=request.user,

                lead_id=(
                    lead_id
                    if lead_id
                    else None
                ),

                deal_id=(
                    deal_id
                    if deal_id
                    else None
                ),

                company_id=(
                    company_id
                    if company_id
                    else None
                ),

                ticket_id=(
                    ticket_id
                    if ticket_id
                    else None
                ),

                call_sid=twilio_call.sid,

                call_status=twilio_call.status,

                # Twilio has only initiated the call.
                call_outcome=None,

                call_date=now.date(),

                call_time=now.time(),

                duration=None,
            )

            return Response(
                {
                    "success": True,

                    "message": (
                        "Twilio call initiated "
                        "successfully."
                    ),

                    "call_sid": twilio_call.sid,

                    "status": twilio_call.status,

                    "to": phone_number,

                    "from": twilio_phone_number,

                    "call_id": call_record.id,

                    "lead": call_record.lead_id,

                    "deal": call_record.deal_id,

                    "company": call_record.company_id,

                    "ticket": call_record.ticket_id,

                    "voice_url": voice_url,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as exc:

            return Response(
                {
                    "success": False,

                    "message": (
                        "Unable to initiate "
                        "Twilio call."
                    ),

                    "error": str(exc),

                    "error_type": (
                        type(exc).__name__
                    ),

                    "twilio_code": getattr(
                        exc,
                        "code",
                        None,
                    ),

                    "twilio_status": getattr(
                        exc,
                        "status",
                        None,
                    ),

                    "twilio_message": getattr(
                        exc,
                        "msg",
                        None,
                    ),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )


# =========================================================
# TWILIO VOICE WEBHOOK
# =========================================================

@method_decorator(
    csrf_exempt,
    name="dispatch",
)
class TwilioVoiceView(APIView):

    permission_classes = []
    authentication_classes = []

    def post(self, request):

        if VoiceResponse is None:

            return HttpResponse(
                "Twilio package is not installed.",
                status=500,
                content_type="text/plain",
            )

        try:

            response = VoiceResponse()

            response.say(
                "Hello. Your call is connected.",
                voice="alice",
                language="en-US",
            )

            response.hangup()

            twiml = str(response)

            return HttpResponse(
                twiml,
                content_type="application/xml",
                status=200,
            )

        except Exception:

            return HttpResponse(
                "Voice webhook error.",
                status=500,
                content_type="text/plain",
            )


# =========================================================
# TWILIO STATUS WEBHOOK
# =========================================================

@method_decorator(
    csrf_exempt,
    name="dispatch",
)
class TwilioCallWebhookView(APIView):

    permission_classes = []
    authentication_classes = []

    def post(self, request):

        # =====================================================
        # HELPER
        # =====================================================

        def get_clean_value(*keys):

            # Exact key
            for key in keys:

                value = request.data.get(key)

                if value is not None:

                    return str(
                        value
                    ).strip()

            # Case-insensitive
            expected_keys = {
                str(key)
                .strip()
                .lower()
                for key in keys
            }

            for received_key, value in (
                request.data.items()
            ):

                clean_received_key = (
                    str(received_key)
                    .strip()
                    .lower()
                )

                if (
                    clean_received_key
                    in expected_keys
                ):

                    if value is not None:

                        return str(
                            value
                        ).strip()

            return ""

        # =====================================================
        # READ TWILIO VALUES
        # =====================================================

        call_sid = get_clean_value(
            "CallSid",
            "call_sid",
        )

        call_status = get_clean_value(
            "CallStatus",
            "call_status",
        )

        call_duration = get_clean_value(
            "CallDuration",
            "call_duration",
        )

        # =====================================================
        # VALIDATE SID
        # =====================================================

        if not call_sid:

            return HttpResponse(
                "CallSid is required.",
                status=400,
                content_type="text/plain",
            )

        # =====================================================
        # FIND SAME CRM CALL
        # =====================================================

        call_record = (
            Call.objects
            .filter(
                call_sid=call_sid
            )
            .first()
        )

        if not call_record:

            return HttpResponse(
                "Call record not found.",
                status=404,
                content_type="text/plain",
            )

        # =====================================================
        # UPDATE STATUS
        # =====================================================

        if call_status:

            call_record.call_status = (
                call_status
            )

        # =====================================================
        # UPDATE DURATION
        # =====================================================

        if call_duration:

            try:

                call_record.duration = int(
                    call_duration
                )

            except (
                TypeError,
                ValueError,
            ):

                pass

        # =====================================================
        # START TIME
        # =====================================================

        if call_status in [
            "in-progress",
            "answered",
        ]:

            if not call_record.started_at:

                call_record.started_at = (
                    timezone.now()
                )

        # =====================================================
        # END TIME
        # =====================================================

        if call_status in [
            "completed",
            "busy",
            "failed",
            "no-answer",
            "canceled",
        ]:

            if not call_record.ended_at:

                call_record.ended_at = (
                    timezone.now()
                )

        # =====================================================
        # AUTOMATIC CALL OUTCOME
        # =====================================================

        if call_status == "completed":

            call_record.call_outcome = (
                "connected"
            )

        elif call_status == "no-answer":

            call_record.call_outcome = (
                "no_answer"
            )

        elif call_status == "busy":

            call_record.call_outcome = (
                "busy"
            )

        elif call_status in [
            "failed",
            "canceled",
        ]:

            call_record.call_outcome = (
                "no_answer"
            )

        # =====================================================
        # AUTOMATIC DATE / TIME
        # =====================================================

        if call_record.started_at:

            local_started_at = (
                timezone.localtime(
                    call_record.started_at
                )
            )

            call_record.call_date = (
                local_started_at.date()
            )

            call_record.call_time = (
                local_started_at.time()
            )

        elif call_record.created_at:

            local_created_at = (
                timezone.localtime(
                    call_record.created_at
                )
            )

            call_record.call_date = (
                local_created_at.date()
            )

            call_record.call_time = (
                local_created_at.time()
            )

        # =====================================================
        # SAVE SAME CALL RECORD
        # =====================================================

        call_record.save()

        return HttpResponse(
            "OK",
            status=200,
            content_type="text/plain",
        )