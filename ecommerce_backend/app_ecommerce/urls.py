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
    path("list_countries/", views.list_countries, name="list_countries"),
    # JWT token views
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # EMAIL
    # path(
    #     'send_orders_confirmation_email/', 
    #     views.send_orders_confirmation_email, 
    #     name='send_orders_confirmation_email'
    # ),
    # static files
    re_path(r'^media/(?P<path>.*\.(jpg|jpeg|png|gif|webp|avif))$', serve, {
        'document_root': settings.MEDIA_ROOT,
    }),
]