from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.leads.models import Lead
from apps.leads.serializers import LeadSerializer

from apps.deals.models import Deal
from apps.deals.serializers import DealSerializer

from apps.users.models import User

from .serializers import DashboardUserSerializer

from apps.services.dashboard_service import DashboardService
from apps.services.team_performance_service import TeamPerformanceService
from apps.services.sales_report_service import SalesReportService


class DashboardView(generics.GenericAPIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        user = request.user

        # =========================================================
        # ADMIN
        # =========================================================

        if getattr(user, "role", None) == "admin":

            # Admin can see all leads
            leads_queryset = Lead.objects.all()

            # Admin can see all deals
            deals_queryset = Deal.objects.all()

            # Admin can see all users
            users_queryset = User.objects.all()

        # =========================================================
        # NORMAL USER
        # =========================================================

        else:

            # Only leads assigned to the logged-in user
            leads_queryset = (
                Lead.objects
                .filter(contact_owners=user)
                .distinct()
            )

            # Only deals assigned to the logged-in user
            deals_queryset = (
                Deal.objects
                .filter(owners=user)
                .distinct()
            )

            # Only the logged-in user
            users_queryset = User.objects.filter(
                id=user.id
            )

        # =========================================================
        # SERIALIZE
        # =========================================================

        leads = LeadSerializer(
            leads_queryset,
            many=True
        ).data

        deals = DealSerializer(
            deals_queryset,
            many=True
        ).data

        users = DashboardUserSerializer(
            users_queryset,
            many=True
        ).data

        # =========================================================
        # DASHBOARD SUMMARY
        # =========================================================

        dashboard_data = DashboardService.calculate(
            leads,
            deals
        )

        # =========================================================
        # TEAM PERFORMANCE
        # =========================================================

        team_performance = TeamPerformanceService.calculate(
            users
        )

        # =========================================================
        # SALES REPORT
        # =========================================================

        period = request.query_params.get(
            "period",
            "monthly"
        )

        sales_report = SalesReportService.calculate(
            deals,
            period=period
        )

        # =========================================================
        # FINAL RESPONSE
        # =========================================================

        return Response({
            **dashboard_data,
            "team_performance": team_performance,
            "sales_report": sales_report,
        })