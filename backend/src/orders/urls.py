from django.urls import path
from .views import *

urlpatterns = [
    # Orders endpoints
    path('orders/', Order_APIVIEW.as_view(), name='orders-list'),
    path('orders/<int:id>/', Order_APIVIEW.as_view(), name='orders-detail'),
    path('orders/<int:order_id>/change_status/', change_order_status),

    # Cargo endpoints
    path('cargo/', Cargo_APIVIEW.as_view(), name='cargo-list'),
    path('cargo/<int:id>/', Cargo_APIVIEW.as_view(), name='cargo-detail'),
    path('cargo_type_rools/', CargoType_APIVIEW.as_view()),
]
