from datetime import date
from decimal import Decimal


class DashboardService:

    @staticmethod
    def calculate(leads, deals):
        total_leads = len(leads)

        active_deals = [
            deal
            for deal in deals
            if deal.get("stage") not in [
                "closed_won",
                "closed_lost",
            ]
        ]

        active_deals_count = len(active_deals)

        closed_deals = [
            deal
            for deal in deals
            if deal.get("stage") in [
                "closed_won",
                "closed_lost",
            ]
        ]

        closed_deals_count = len(closed_deals)

        today = date.today()
        monthly_revenue = Decimal("0")

        for deal in deals:
            if deal.get("stage") != "closed_won":
                continue

            close_date = deal.get("close_date")

            if not close_date:
                continue

            if isinstance(close_date, str):
                close_date = date.fromisoformat(close_date)

            if (
                close_date.month == today.month
                and close_date.year == today.year
            ):
                monthly_revenue += Decimal(
                    str(deal.get("amount") or 0)
                )

        def count_stage(stages):
            return len([
                deal
                for deal in deals
                if deal.get("stage") in stages
            ])

        new_count = count_stage(["new"])
        qualified_count = count_stage(["qualified"])
        proposal_count = count_stage(["proposal"])
        negotiation_count = count_stage(["negotiation"])
        closed_won_count = count_stage(["closed_won"])
        closed_lost_count = count_stage(["closed_lost"])

        total_deals = len(deals)

        def percentage(count):
            if total_deals == 0:
                return 0

            return round(
                (count / total_deals) * 100,
                2,
            )

        conversion_pipeline = [
            {
                "key": "new",
                "label": "New",
                "count": new_count,
                "value": percentage(new_count),
                "color": "#1976D2",
            },
            {
                "key": "qualified",
                "label": "Qualified",
                "count": qualified_count,
                "value": percentage(qualified_count),
                "color": "#26C6DA",
            },
            {
                "key": "proposal",
                "label": "Proposal",
                "count": proposal_count,
                "value": percentage(proposal_count),
                "color": "#FFCA28",
            },
            {
                "key": "negotiation",
                "label": "Negotiation",
                "count": negotiation_count,
                "value": percentage(negotiation_count),
                "color": "#1976D2",
            },
            {
                "key": "closed_won",
                "label": "Closed Won",
                "count": closed_won_count,
                "value": percentage(closed_won_count),
                "color": "#00C853",
            },
            {
                "key": "closed_lost",
                "label": "Closed Lost",
                "count": closed_lost_count,
                "value": percentage(closed_lost_count),
                "color": "#EF5350",
            },
        ]

        return {
            "total_leads": total_leads,
            "active_deals": active_deals_count,
            "closed_deals": closed_deals_count,
            "monthly_revenue": float(monthly_revenue),
            "conversion_pipeline": conversion_pipeline,
        }