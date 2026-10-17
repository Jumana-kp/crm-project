from django.db.models import Q

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.leads.models import Lead
from apps.deals.models import Deal
from apps.companies.models import Company
from apps.tickets.models import Ticket
from apps.users.models import User

class GlobalSearchView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):

        # ------------------------------------
        # 1. Get search keyword
        # ------------------------------------
        search_query = request.query_params.get(
            "search",
            ""
        ).strip()

        # Don't return the entire CRM for empty search
        if not search_query:
            return Response(
                {
                    "search": "",
                    "count": 0,
                    "results": [],
                }
            )

        user = request.user

        # ====================================
        # 2. LEAD QUERYSET
        # ====================================
        lead_queryset = (
            Lead.objects
            .select_related("company")
            .prefetch_related("contact_owners")
        )

        # Permission filtering
        if getattr(user, "role", None) != "admin":
            lead_queryset = lead_queryset.filter(
                contact_owners=user
            ).distinct()

        # Lead search
        lead_queryset = lead_queryset.filter(
            Q(
                first_name__icontains=
                search_query
            )
            | Q(
                last_name__icontains=
                search_query
            )
            | Q(
                email__icontains=
                search_query
            )
            | Q(
                phone_number__icontains=
                search_query
            )
            | Q(
                city__icontains=
                search_query
            )
            | Q(
                job_title__icontains=
                search_query
            )
            | Q(
                contact_owners__first_name__icontains=
                search_query
            )
            | Q(
                contact_owners__last_name__icontains=
                search_query
            )
            | Q(
                contact_owners__email__icontains=
                search_query
            )
            | Q(
                company__company_name__icontains=
                search_query
            )
        ).distinct()

        # ====================================
        # 3. DEAL QUERYSET
        # ====================================
        deal_queryset = (
            Deal.objects
            .select_related("lead")
            .prefetch_related("owners")
        )

        # Permission filtering
        if getattr(user, "role", None) != "admin":
            deal_queryset = deal_queryset.filter(
                owners=user
            ).distinct()

        # Deal search
        deal_queryset = deal_queryset.filter(
            Q(
                deal_name__icontains=
                search_query
            )
            | Q(
                stage__icontains=
                search_query
            )
            | Q(
                priority__icontains=
                search_query
            )
            | Q(
                lead__first_name__icontains=
                search_query
            )
            | Q(
                lead__last_name__icontains=
                search_query
            )
            | Q(
                lead__email__icontains=
                search_query
            )
            | Q(
                lead__phone_number__icontains=
                search_query
            )
            | Q(
                lead__city__icontains=
                search_query
            )
            | Q(
                lead__lead_status__icontains=
                search_query
            )
            | Q(
                owners__first_name__icontains=
                search_query
            )
            | Q(
                owners__last_name__icontains=
                search_query
            )
            | Q(
                owners__email__icontains=
                search_query
            )
        ).distinct()


                # ====================================
        # COMPANY QUERYSET
        # ====================================

        company_queryset = (
            Company.objects
            .prefetch_related("company_owners")
        )

        if getattr(user, "role", None) != "admin":
            company_queryset = company_queryset.filter(
                company_owners=user
            ).distinct()

        company_queryset = company_queryset.filter(
            Q(company_name__icontains=search_query)
            | Q(domain_name__icontains=search_query)
            | Q(email__icontains=search_query)
            | Q(phone_number__icontains=search_query)
            | Q(city__icontains=search_query)
            | Q(country__icontains=search_query)
            | Q(industry__icontains=search_query)
            | Q(company_type__icontains=search_query)
            | Q(
                company_owners__first_name__icontains=
                search_query
            )
            | Q(
                company_owners__last_name__icontains=
                search_query
            )
            | Q(
                company_owners__email__icontains=
                search_query
            )
        ).distinct()

        
                # ====================================
        # TICKET QUERYSET
        # ====================================

        ticket_queryset = (
            Ticket.objects
            .select_related(
                "associated_deal",
                "associated_deal__lead",
            )
            .prefetch_related(
                "ticket_owners",
                "associated_deal__owners",
            )
        )
        if getattr(user, "role", None) != "admin":
                   ticket_queryset = ticket_queryset.filter(
                          ticket_owners=user
          ).distinct()
        ticket_queryset = ticket_queryset.filter(
    Q(
        ticket_name__icontains=search_query
    )
    | Q(
        description__icontains=search_query
    )
    | Q(
        ticket_status__icontains=search_query
    )
    | Q(
        source__icontains=search_query
    )
    | Q(
        priority__icontains=search_query
    )
    | Q(
        ticket_owners__first_name__icontains=
        search_query
    )
    | Q(
        ticket_owners__last_name__icontains=
        search_query
    )
    | Q(
        ticket_owners__email__icontains=
        search_query
    )
    | Q(
        associated_deal__deal_name__icontains=
        search_query
    )
    | Q(
        associated_deal__lead__first_name__icontains=
        search_query
    )
    | Q(
        associated_deal__lead__last_name__icontains=
        search_query
    )
    | Q(
        associated_deal__lead__email__icontains=
        search_query
    )
    | Q(
        associated_deal__lead__phone_number__icontains=
        search_query
    )
    | Q(
        associated_deal__lead__city__icontains=
        search_query
    )
    | Q(
        associated_deal__lead__lead_status__icontains=
        search_query
    )
    | Q(
        associated_deal__owners__first_name__icontains=
        search_query
    )
    | Q(
        associated_deal__owners__last_name__icontains=
        search_query
    )
    | Q(
        associated_deal__owners__email__icontains=
        search_query
    )
).distinct()
        
                    # ====================================
            # USER QUERYSET
            # ====================================

        user_queryset = User.objects.all()
        
        user_queryset = user_queryset.filter(
    Q(
        first_name__icontains=search_query
    )
    | Q(
        last_name__icontains=search_query
    )
    | Q(
        email__icontains=search_query
    )
    | Q(
        phone_number__icontains=search_query
    )
    | Q(
        role__icontains=search_query
    )
    | Q(
        company_name__icontains=search_query
    )
    | Q(
        country__icontains=search_query
    )
    | Q(
        industry_type__icontains=search_query
    )
)
        
        # ====================================
        # 4. COMMON RESULTS LIST
        # ====================================
        results = []

        # ====================================
        # 5. LEAD RESULTS
        # ====================================
        for lead in lead_queryset:

            owners = [
                {
                    "id": owner.id,
                    "name": (
                        owner.get_full_name()
                        or owner.email
                    ),
                }
                for owner in lead.contact_owners.all()
            ]

            results.append(
                {
                    "type": "lead",
                    "id": lead.id,
                    "name": (
                        f"{lead.first_name} "
                        f"{lead.last_name}"
                    ).strip(),
                    "first_name": lead.first_name,
                    "last_name": lead.last_name,
                    "email": lead.email,
                    "phone_number": lead.phone_number,
                    "lead_status": lead.lead_status,
                    "city": lead.city,
                    "job_title": lead.job_title,

                    "company": (
                        {
                            "id": lead.company.id,
                            "name": (
                                lead.company.company_name
                            ),
                        }
                        if lead.company
                        else None
                    ),

                    "contact_owners": owners,
                }
            )

        # ====================================
        # 6. DEAL RESULTS
        # ====================================
        for deal in deal_queryset:

            owners = [
                {
                    "id": owner.id,
                    "name": (
                        owner.get_full_name()
                        or owner.email
                    ),
                }
                for owner in deal.owners.all()
            ]

            results.append(
                {
                    "type": "deal",
                    "id": deal.id,
                    "name": deal.deal_name,
                    "amount": deal.amount,
                    "stage": deal.stage,
                    "priority": deal.priority,
                    "close_date": deal.close_date,

                    "lead": (
                        {
                            "id": deal.lead.id,
                            "name": (
                                f"{deal.lead.first_name} "
                                f"{deal.lead.last_name}"
                            ).strip(),
                            "email": deal.lead.email,
                            "phone_number": (
                                deal.lead.phone_number
                            ),
                        }
                        if deal.lead
                        else None
                    ),

                    "owners": owners,
                }
            )
        
                # ====================================
        # 8. COMPANY RESULTS
        # ====================================

        for company in company_queryset:

            owners = [
                {
                    "id": owner.id,
                    "name": (
                        owner.get_full_name()
                        or owner.email
                    ),
                }
                for owner in company.company_owners.all()
            ]

            results.append(
                {
                    "type": "company",
                    "id": company.id,
                    "name": company.company_name,
                    "domain_name": company.domain_name,
                    "email": company.email,
                    "phone_number": company.phone_number,
                    "industry": company.industry,
                    "company_type": company.company_type,
                    "city": company.city,
                    "country": company.country,
                    "no_of_employees": company.no_of_employees,
                    "annual_revenue": company.annual_revenue,
                    "company_owners": owners,
                }
            )
        
                # ====================================
        # TICKET RESULTS
        # ====================================

        for ticket in ticket_queryset:

            owners = [
                {
                    "id": owner.id,
                    "name": (
                        owner.get_full_name()
                        or owner.email
                    ),
                }
                for owner in ticket.ticket_owners.all()
            ]

            associated_deal_owners = []

            if ticket.associated_deal:
                associated_deal_owners = [
                    {
                        "id": owner.id,
                        "name": (
                            owner.get_full_name()
                            or owner.email
                        ),
                    }
                    for owner in ticket.associated_deal.owners.all()
                ]

            results.append(
                {
                    "type": "ticket",
                    "id": ticket.id,
                    "name": ticket.ticket_name,
                    "description": ticket.description,
                    "ticket_status": ticket.ticket_status,
                    "source": ticket.source,
                    "priority": ticket.priority,

                    "ticket_owners": owners,

                    "associated_deal": (
                        {
                            "id": ticket.associated_deal.id,
                            "name": (
                                ticket.associated_deal.deal_name
                            ),
                            "owners": associated_deal_owners,

                            "lead": (
                                {
                                    "id": (
                                        ticket.associated_deal
                                        .lead.id
                                    ),
                                    "name": (
                                        f"{ticket.associated_deal.lead.first_name} "
                                        f"{ticket.associated_deal.lead.last_name}"
                                    ).strip(),
                                    "email": (
                                        ticket.associated_deal
                                        .lead.email
                                    ),
                                    "phone_number": (
                                        ticket.associated_deal
                                        .lead.phone_number
                                    ),
                                }
                                if ticket.associated_deal.lead
                                else None
                            ),
                        }
                        if ticket.associated_deal
                        else None
                    ),
                }
            )
            
                    # ====================================
        # USER RESULTS
        # ====================================

        for searched_user in user_queryset:

            results.append(
                {
                    "type": "user",
                    "id": searched_user.id,
                    "name": (
                        f"{searched_user.first_name} "
                        f"{searched_user.last_name}"
                    ).strip()
                    or searched_user.email,

                    "first_name": searched_user.first_name,
                    "last_name": searched_user.last_name,
                    "email": searched_user.email,
                    "phone_number": searched_user.phone_number,
                    "role": searched_user.role,
                    "company_name": searched_user.company_name,
                    "country": searched_user.country,
                    "industry_type": searched_user.industry_type,
                }
            )
        # ====================================
        # 7. FINAL RESPONSE
        # ====================================
        return Response(
            {
                "search": search_query,
                "count": len(results),
                "results": results,
            }
        )