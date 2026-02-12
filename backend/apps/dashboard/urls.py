from django.urls import path

from .views import OccupancyView, RevenueView, TodayView

urlpatterns = [
    path("today/", TodayView.as_view(), name="dashboard-today"),
    path("occupancy/", OccupancyView.as_view(), name="dashboard-occupancy"),
    path("revenue/", RevenueView.as_view(), name="dashboard-revenue"),
]
