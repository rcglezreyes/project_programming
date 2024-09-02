from django.urls import path
from . import views

urlpatterns = [
    path("list_users/", views.list_users, name="list_users"),
    path("manage_user/", views.manage_user, name="manage_user"),
]