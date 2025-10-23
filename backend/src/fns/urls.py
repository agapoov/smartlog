from django.urls import path

from fns.views import FNSCompanyInfoView

urlpatterns = [
    path('check/', FNSCompanyInfoView.as_view()),
    ]