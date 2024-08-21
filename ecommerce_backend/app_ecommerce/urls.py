from django.urls import path  # Importa include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.static import static
from django.conf import settings
from . import views

urlpatterns = [
    # authenticated views
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    # list views
    path("list_countries/", views.list_countries, name="list_countries"),
    path("list_users/", views.list_users, name="list_users"),
    path("list_customers/", views.list_customers, name="list_customers"),
    path("list_categories/", views.list_categories, name="list_categories"),
    path("list_products/", views.list_products, name="list_products"),
    # manage views
    path("manage_customer/", views.manage_customer, name="manage_customer"),
    path("manage_product/", views.manage_product, name="manage_product"),
    # delete views
    path("delete_customer/", views.delete_customer, name="delete_customer"),
    # upload views
    path('upload_image/', views.upload_image, name='upload_image'),
    # JWT token views
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]