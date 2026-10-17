from datetime import date
from decimal import Decimal


class TeamPerformanceService:

    @staticmethod
    def calculate(users):
        today = date.today()

        current_month = today.month
        current_year = today.year

        if current_month == 1:
            previous_month = 12
            previous_year = current_year - 1
        else:
            previous_month = current_month - 1
            previous_year = current_year

        team_performance = []

        for user in users:
            user_id = user.get("id")

            first_name = user.get(
                "first_name",
                ""
            )

            last_name = user.get(
                "last_name",
                ""
            )

            name = (
                f"{first_name} {last_name}"
            ).strip()

            if not name:
                name = "Unknown"

            user_deals = user.get(
                "deals",
                []
            )

            active_deals = [
                deal
                for deal in user_deals
                if deal.get("stage") not in [
                    "closed_won",
                    "closed_lost",
                ]
            ]

            closed_deals = [
                deal
                for deal in user_deals
                if deal.get("stage") in [
                    "closed_won",
                    "closed_lost",
                ]
            ]

            closed_won_deals = [
                deal
                for deal in user_deals
                if deal.get("stage") == "closed_won"
            ]

            total_revenue = Decimal("0")

            for deal in closed_won_deals:
                total_revenue += Decimal(
                    str(
                        deal.get("amount") or 0
                    )
                )

            current_month_revenue = Decimal("0")
            previous_month_revenue = Decimal("0")

            for deal in closed_won_deals:
                close_date = deal.get(
                    "close_date"
                )

                if not close_date:
                    continue

                if isinstance(
                    close_date,
                    str
                ):
                    close_date = date.fromisoformat(
                        close_date
                    )

                amount = Decimal(
                    str(
                        deal.get("amount") or 0
                    )
                )

                if (
                    close_date.month == current_month
                    and close_date.year == current_year
                ):
                    current_month_revenue += amount

                elif (
                    close_date.month == previous_month
                    and close_date.year == previous_year
                ):
                    previous_month_revenue += amount

            if previous_month_revenue == 0:
                if current_month_revenue > 0:
                    revenue_change = 100.0
                else:
                    revenue_change = 0.0
            else:
                revenue_change = round(
                    (
                        (
                            current_month_revenue
                            - previous_month_revenue
                        )
                        / previous_month_revenue
                    )
                    * 100,
                    2,
                )

            is_positive = revenue_change >= 0

            team_performance.append({
                "id": user_id,
                "name": name,
                "active_deals": len(active_deals),
                "closed_deals": len(closed_deals),
                "revenue": float(total_revenue),
                "change": (
                    f"+{revenue_change}%"
                    if is_positive
                    else f"{revenue_change}%"
                ),
                "is_positive": is_positive,
            })

        return team_performance