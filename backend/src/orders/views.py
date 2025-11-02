import requests
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from integrations.rools import ROOLS_BASE
from src.settings import ROOLS_API_KEY
from .serializers import OrderSerializer, CargoSerializer, OrderCreateSerializer
from src.common import Base_APIVIEW, EnumBaseView
from .models import Cargo, Order, CargoTypeRools


class Order_APIVIEW(Base_APIVIEW):
    model = Order
    create_serializer = OrderCreateSerializer
    base_serializer = OrderSerializer
    paginate = True

class Cargo_APIVIEW(Base_APIVIEW):
    model = Cargo
    create_serializer = CargoSerializer
    base_serializer = CargoSerializer
    paginate = True

class CargoType_APIVIEW(EnumBaseView):
    """
    GET /api/cargo_type_rools/
    """
    model = CargoTypeRools


@api_view(['PATCH'])
def change_order_status(request, order_id):
    """
    API статусов заказов
    """
    order = Order.objects.filter(id=order_id).first()
    if not order:
        return Response(
            {"details": "Заказ не найден"},
            status=status.HTTP_400_BAD_REQUEST
        )

    new_status = request.data.get("status")

    valid_statuses = [value for value, label in Order.OrderStatus.choices]
    if new_status not in valid_statuses:
        return Response(
            {"details": f"Некорректное значение статуса. Доступные: {', '.join(valid_statuses)}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    #   Наши статусы
    # DRAFT = 'DRAFT', 'Черновик'
    # POSTED = 'POSTED', 'Опубликован'
    # CONFIRMATION = 'CONFIRMATION', 'Утверждение'
    # COMPLETED = 'COMPLETED', 'Выполнен'
    # CLOSED = 'CLOSED', 'Закрыт'

    #   Статусы rools
    # "not_published",
    # "published",
    # "await_confirm",
    # "confirmation",
    # "deal_made",
    # "closed"

    rools_status_mapping = {
        "DRAFT" : "not_published",
        "POSTED" : "published",
        "CONFIRMATION" : "confirmation",
        "COMPLETED" : "deal_made",
        "CLOSED" : "closed",
    }
    rools_success = None
    ati_success = True # Пока логики нет, сделаем его по дефолту успешным

    if order.ati_id:
        # Тут логика смены статуса на бирже ATI.SU
        pass

    ati_resp = {}
    rools_resp = {}
    if order.rools_id:
        rools_success = False

        url = f"{ROOLS_BASE}public-api/v1/exchange/offer/{order.rools_id}/status?apikey={ROOLS_API_KEY}"
        payload = {"status": rools_status_mapping[new_status]}

        try:
            rools_resp = requests.patch(url, json=payload, timeout=10)
            rools_resp.raise_for_status()
        except requests.RequestException as e:
            return Response(
                {"details": "Ошибка при получении данных от API ROOLS"},
                status=status.HTTP_400_BAD_REQUEST
            )
        if rools_resp.json() == {}:
            rools_success = True

    if not rools_success:
        return Response(
            {"details": f"Не удалось изменить статус на ROOLS. Ошибка: {rools_resp.json()}"},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not ati_success:
        return Response(
            {"details": f"Не удалось изменить статус на ATI.SU."},
            status=status.HTTP_400_BAD_REQUEST
        )

    order.status = new_status
    order.save()
    return Response(
        {"message": "Статус успешно изменён"}
    )