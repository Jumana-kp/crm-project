from django.urls import path, include


urlpatterns = [
    path("users/", include("apps.users.urls")),
    path("companies/", include("apps.companies.urls")),
    path("products/", include("apps.products.urls")),
    path("leads/", include("apps.leads.urls")),
    path("deals/", include("apps.deals.urls")),
    path("tickets/", include("apps.tickets.urls")),
    path("notes/",include("apps.activities.notes.urls")),
    path("emails/",include("apps.activities.emails.urls")),
    path("meeting/",include("apps.activities.meetings.urls")),
    path("calls/",include("apps.activities.calls.urls")),
    path("tasks/",include("apps.activities.tasks.urls")),
    path("attachments/",include("apps.activities.attachments.urls")),
    path("dashboard/", include("apps.dashboard.urls")),
    path( "global-search/", include("apps.global_search.urls")),
    path("notifications/", include("apps.notifications.urls"),),
]
   