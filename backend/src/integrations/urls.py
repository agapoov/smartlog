from django.urls import path, include
from . import views
from .rools import *

urlpatterns = [
    # ATI.SU интеграция
    path('ati/send_cargo_order/', views.send_cargo_and_order_to_ati, name='send_cargo_and_order_to_ati'),
    
    # Транспортные предложения
    path('transport/find_offers/', views.find_transport_offers, name='find_transport_offers'),
    path('transport/respond/', views.respond_to_offer, name='respond_to_offer'),
    path('transport/response/<int:response_id>/', views.get_response_status, name='get_response_status'),
    
    # Управление откликами
    path('transport/responses/', views.get_transport_responses, name='get_transport_responses'),

    # это для админа, управлять статусами откликов
    path('transport/response/<int:response_id>/update/', views.update_response_status, name='update_response_status'),

    path("rools/", include([
        path("geo_search/", get_geo_info),
        path("order_status/", rools_order_status),
        path("post_order/", post_order),
        path("order_details/", rools_offer_details),
    ]))
]