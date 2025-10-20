from django.urls import path
from . import views

urlpatterns = [
    path('ati/send_cargo_order/', views.send_cargo_and_order_to_ati, name='send_cargo_and_order_to_ati'),
]