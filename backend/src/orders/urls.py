from django.urls import path
from .views import Order_APIVIEW, Cargo_APIVIEW

urlpatterns = [
    # Orders endpoints
    path('orders/', Order_APIVIEW.as_view(), name='orders-list'),
    path('orders/<int:id>/', Order_APIVIEW.as_view(), name='orders-detail'),
    
    # Cargo endpoints
    path('cargo/', Cargo_APIVIEW.as_view(), name='cargo-list'),
    path('cargo/<int:id>/', Cargo_APIVIEW.as_view(), name='cargo-detail'),
]
