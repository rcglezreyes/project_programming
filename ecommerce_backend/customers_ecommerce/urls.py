from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.static import static
from django.views.static import serve
from django.conf import settings
from . import views

urlpatterns = [
    path("list_customers/", views.list_customers, name="list_customers"),
    path("manage_customer/", views.manage_customer, name="manage_customer"),
    path("delete_customer/", views.delete_customer, name="delete_customer"),
]