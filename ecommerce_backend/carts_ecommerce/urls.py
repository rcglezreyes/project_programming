from django.urls import path
from . import views

urlpatterns = [
    path("list_carts/", views.list_carts, name="list_carts"),
    path("manage_cart/", views.manage_cart, name="manage_cart"),
    path("delete_cart/", views.delete_cart, name="delete_cart"),
]