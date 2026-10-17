from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Notification


class NotificationListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        notifications = Notification.objects.filter(
            user=request.user
        ).order_by("-created_at")

        results = []

        for notification in notifications:
            results.append({
                "id": notification.id,
                "message": notification.message,
                "is_read": notification.is_read,
                "created_at": notification.created_at,
            })

        return Response({
            "success": True,
            "count": len(results),
            "results": results,
        })


class NotificationUnreadCountView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        unread_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).count()

        return Response({
            "success": True,
            "unread_count": unread_count,
        })


class NotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        try:
            notification = Notification.objects.get(
                id=pk,
                user=request.user,
            )

        except Notification.DoesNotExist:
            return Response(
                {
                    "success": False,
                    "message": "Notification not found.",
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response({
            "success": True,
            "message": "Notification marked as read.",
        })


class NotificationReadAllView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request):

        updated_count = Notification.objects.filter(
            user=request.user,
            is_read=False,
        ).update(is_read=True)

        return Response({
            "success": True,
            "message": "All notifications marked as read.",
            "updated_count": updated_count,
        })