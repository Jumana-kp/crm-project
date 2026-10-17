from datetime import date, timedelta
from decimal import Decimal
import calendar


class SalesReportService:

    @staticmethod
    def calculate(deals, period="monthly"):
        if period == "weekly":
            return SalesReportService.calculate_weekly(deals)

        return SalesReportService.calculate_monthly(deals)

    @staticmethod
    def calculate_monthly(deals, months=12):
        today = date.today()

        month_list = []

        for i in range(months - 1, -1, -1):
            month = today.month - i
            year = today.year

            while month <= 0:
                month += 12
                year -= 1

            month_list.append({
                "month": month,
                "year": year,
            })

        sales_report = []

        for item in month_list:
            month = item["month"]
            year = item["year"]

            actual = Decimal("0")

            for deal in deals:
                if deal.get("stage") != "closed_won":
                    continue

                close_date = deal.get("close_date")

                if not close_date:
                    continue

                if isinstance(close_date, str):
                    close_date = date.fromisoformat(
                        close_date
                    )

                if (
                    close_date.month == month
                    and close_date.year == year
                ):
                    actual += Decimal(
                        str(deal.get("amount") or 0)
                    )

            target = Decimal("10000")

            sales_report.append({
                "label": calendar.month_abbr[month],
                "year": year,
                "actual": float(actual),
                "target": float(target),
            })

        return sales_report

    @staticmethod
    def calculate_weekly(deals, weeks=12):
        today = date.today()

        current_week_start = today - timedelta(
            days=today.weekday()
        )

        sales_report = []

        for i in range(weeks - 1, -1, -1):
            week_start = current_week_start - timedelta(
                weeks=i
            )

            week_end = week_start + timedelta(
                days=6
            )

            actual = Decimal("0")

            for deal in deals:
                if deal.get("stage") != "closed_won":
                    continue

                close_date = deal.get("close_date")

                if not close_date:
                    continue

                if isinstance(close_date, str):
                    close_date = date.fromisoformat(
                        close_date
                    )

                if week_start <= close_date <= week_end:
                    actual += Decimal(
                        str(deal.get("amount") or 0)
                    )

            target = Decimal("10000")

            sales_report.append({
                "label": week_start.strftime("%d %b"),
                "year": week_start.year,
                "actual": float(actual),
                "target": float(target),
            })

        return sales_report