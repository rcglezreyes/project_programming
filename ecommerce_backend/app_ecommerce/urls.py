from django.urls import path, re_path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf.urls.static import static
from django.views.static import serve
from django.conf import settings
from . import views

urlpatterns = [
    # authenticated views
    path("login/", views.login_view, name="login"),
    path("logout/", views.logout_view, name="logout"),
    path("get_session_data/", views.get_session_data, name="get_session_data"),
    # list views
    path("list_countries/", views.list_countries, name="list_countries"),
    path("list_users/", views.list_users, name="list_users"),
    path("list_customers/", views.list_customers, name="list_customers"),
    path("list_categories/", views.list_categories, name="list_categories"),
    path("list_products/", views.list_products, name="list_products"),
    path("list_carts/", views.list_carts, name="list_carts"),
    path("list_orders/", views.list_orders, name="list_orders"),
    # manage views
    path("manage_customer/", views.manage_customer, name="manage_customer"),
    path("manage_product/", views.manage_product, name="manage_product"),
    path("manage_cart/", views.manage_cart, name="manage_cart"),
    path("manage_order/", views.manage_order, name="manage_order"),
    # delete views
    path("delete_customer/", views.delete_customer, name="delete_customer"),
    path("delete_product/", views.delete_product, name="delete_product"),
    path("delete_cart/", views.delete_cart, name="delete_cart"),    
    # upload views
    path('upload_image/', views.upload_image, name='upload_image'),
    # JWT token views
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    re_path(r'^media/(?P<path>.*\.(jpg|jpeg|png|gif|webp|avif))$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]