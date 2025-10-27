# views.py
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from .serializers import FNSRequestSerializer
from .services import FNSService


class FNSCompanyInfoView(APIView):
    """
    API для получения информации об организации из ФНС по ОГРН
    """

    def get(self, request):
        serializer = FNSRequestSerializer(data=request.query_params)

        if not serializer.is_valid():
            return Response(
                {'error': 'Invalid data', 'details': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        ogrn = serializer.validated_data['ogrn']
        fns_service = FNSService()

        try:
            company_info = fns_service.get_company_info(ogrn)

            if company_info is None:
                return Response(
                    {'error': 'Failed to get data from FNS API'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE
                )

            if 'error' in company_info:
                return Response(
                    company_info,
                    status=status.HTTP_404_NOT_FOUND
                )

            return Response(company_info)

        except ValueError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )