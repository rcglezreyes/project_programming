from django.urls import path
from . import views

urlpatterns = [
    path("list_categories/", views.list_categories, name="list_categories"),
    path("list_products/", views.list_products, name="list_products"),
    path("manage_product/", views.manage_product, name="manage_product"),
    path("delete_product/", views.delete_product, name="delete_product"),
    path('upload_image/', views.upload_image, name='upload_image'),
]