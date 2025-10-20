from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from src.common import BadRequestException
from orders.models import Order
from .atisu import create_order


@api_view(["POST"])
def send_cargo_and_order_to_ati(request):
    response_data = {}
    status_code = status.HTTP_200_OK
    try:
        order_id = request.data.get("order_id")

        if not order_id:
            raise BadRequestException("Не передан order_id")
        
        order = Order.objects.get(id=order_id)

        if not order.cargo:
            raise BadRequestException("Заказ не имеет связанного груза")

        try:
            cargo_id, deal_id = create_order(order)
        except Exception as exc:
            raise BadRequestException(f"Ошибка создания заказа на ATI: {exc}")

        if not cargo_id or not deal_id:
            raise BadRequestException("Не удалось создать груз или заказ на ATI")

        order.ati_id = deal_id
        order.cargo.ati_id = cargo_id
        order.cargo.save()
        order.save()

        response_data["cargo_id"] = cargo_id
        response_data["deal_id"] = deal_id
        response_data["data"] = "Груз и заказ успешно размещены на платформе ati.su"

    except Order.DoesNotExist:
        raise BadRequestException("Заказ с таким ID не найден")

    except BadRequestException as exc:
        response_data["details"] = exc.response
        status_code = exc.status
    
    return Response(response_data, status=status_code)