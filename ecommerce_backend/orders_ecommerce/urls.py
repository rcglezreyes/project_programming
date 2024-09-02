from django.urls import path
from . import views

urlpatterns = [
    path("list_orders/", views.list_orders, name="list_orders"),
    path("manage_order/", views.manage_order, name="manage_order"),
]