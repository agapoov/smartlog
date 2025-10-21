from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from src.common import BadRequestException
from orders.models import Order
from .atisu import create_order
from .mock import get_top_offers
from .models import TransportOffer, TransportResponse


@api_view(["POST"])
def send_cargo_and_order_to_ati(request):
    """Отправка груза и заказа на ATI.SU (не пашет..)"""
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


@api_view(["POST"])
def find_transport_offers(request):
    """Поиск лучших предложений по перевозке"""
    response_data = {}
    status_code = status.HTTP_200_OK
    
    try:
        order_id = request.data.get("order_id")
        
        if not order_id:
            raise BadRequestException("Не передан order_id")
        
        order = Order.objects.get(id=order_id)
        
        if not order.cargo:
            raise BadRequestException("Заказ не имеет связанного груза")
        
        offers = get_top_offers(order, limit=5)
        
        total_coefficient = sum(offer['coefficient'] for offer in offers) / len(offers) if offers else 0
        
        response_data = {
            "offers": offers,
            "total_coefficient": round(total_coefficient, 3),
            "order_info": {
                "id": order.id,
                "route": f"{order.start_address} → {order.end_address}",
                "distance": order.distance,
                "cargo_weight": order.cargo.cargo_weight,
                "cargo_volume": order.cargo.cargo_volume
            },
            "message": f"Найдено {len(offers)} предложений по перевозке"
        }
        
    except Order.DoesNotExist:
        raise BadRequestException("Заказ с таким ID не найден")
    
    except BadRequestException as exc:
        response_data["details"] = exc.response
        status_code = exc.status
    
    except Exception as exc:
        raise BadRequestException(f"Ошибка поиска предложений: {str(exc)}")
    
    return Response(response_data, status=status_code)


@api_view(["POST"])
def respond_to_offer(request):
    """Отклик на предложение перевозчика"""
    response_data = {}
    status_code = status.HTTP_200_OK
    
    try:
        offer_id = request.data.get("offer_id")
        order_id = request.data.get("order_id")
        
        if not offer_id:
            raise BadRequestException("Не передан offer_id")
        
        if not order_id:
            raise BadRequestException("Не передан order_id")
        
        offer = TransportOffer.objects.get(id=offer_id)
        order = Order.objects.get(id=order_id)
        
        # Создаем отклик
        response = TransportResponse.objects.create(
            offer=offer,
            order=order,
            status=TransportResponse.Status.PENDING
        )
        
        response_data = {
            "response_id": response.id,
            "offer_id": offer.id,
            "order_id": order.id,
            "status": response.get_status_display(),
            "message": "Отклик успешно отправлен перевозчику"
        }
        
    except TransportOffer.DoesNotExist:
        raise BadRequestException("Предложение с таким ID не найдено")
    
    except Order.DoesNotExist:
        raise BadRequestException("Заказ с таким ID не найден")
    
    except BadRequestException as exc:
        response_data["details"] = exc.response
        status_code = exc.status
    
    except Exception as exc:
        raise BadRequestException(f"Ошибка создания отклика: {str(exc)}")
    
    return Response(response_data, status=status_code)


@api_view(["GET"])
def get_response_status(request, response_id):
    """Получение статуса отклика"""
    response_data = {}
    status_code = status.HTTP_200_OK
    
    try:
        response = TransportResponse.objects.get(id=response_id)
        
        response_data = {
            "response_id": response.id,
            "offer_id": response.offer.id,
            "order_id": response.order.id,
            "carrier_name": response.offer.carrier_name,
            "status": response.get_status_display(),
            "comment": response.comment,
            "created_at": response.created_at,
            "updated_at": response.updated_at
        }
        
    except TransportResponse.DoesNotExist:
        raise BadRequestException("Отклик с таким ID не найден")
    
    except BadRequestException as exc:
        response_data["details"] = exc.response
        status_code = exc.status
    
    except Exception as exc:
        raise BadRequestException(f"Ошибка получения статуса: {str(exc)}")
    
    return Response(response_data, status=status_code)


@api_view(["GET"])
def get_transport_responses(request):
    """Получение списка всех откликов"""
    response_data = {}
    status_code = status.HTTP_200_OK
    
    try:
        order_id = request.GET.get('order_id')
        status_filter = request.GET.get('status')
        limit = int(request.GET.get('limit', 20))
        offset = int(request.GET.get('offset', 0))
        
        responses = TransportResponse.objects.select_related('offer', 'order').all()
        
        if order_id:
            responses = responses.filter(order_id=order_id)
        
        if status_filter:
            responses = responses.filter(status=status_filter)
        
        responses = responses.order_by('-created_at')[offset:offset + limit]
        
        response_list = []
        for response in responses:
            response_list.append({
                "response_id": response.id,
                "offer_id": response.offer.id,
                "order_id": response.order.id,
                "carrier_name": response.offer.carrier_name,
                "carrier_inn": response.offer.carrier_inn,
                "offer_price": response.offer.price,
                "offer_delivery_time": response.offer.delivery_time,
                "status": response.get_status_display(),
                "status_code": response.status,
                "comment": response.comment,
                "created_at": response.created_at,
                "updated_at": response.updated_at,
                "order_info": {
                    "route": f"{response.order.start_address} → {response.order.end_address}",
                    "distance": response.order.distance,
                    "cargo_weight": response.order.cargo.cargo_weight if response.order.cargo else None
                }
            })
        
        response_data = {
            "responses": response_list,
            "total_count": TransportResponse.objects.count(),
            "filtered_count": len(response_list),
            "filters": {
                "order_id": order_id,
                "status": status_filter,
                "limit": limit,
                "offset": offset
            }
        }
        
    except Exception as exc:
        raise BadRequestException(f"Ошибка получения откликов: {str(exc)}")
    
    return Response(response_data, status=status_code)


@api_view(["GET"])
def get_responses_by_order(request, order_id):
    """Получение всех откликов по конкретному заказу"""
    response_data = {}
    status_code = status.HTTP_200_OK
    
    try:
        order = Order.objects.get(id=order_id)
        responses = TransportResponse.objects.filter(order=order).select_related('offer').order_by('-created_at')
        
        response_list = []
        for response in responses:
            response_list.append({
                "response_id": response.id,
                "offer_id": response.offer.id,
                "carrier_name": response.offer.carrier_name,
                "carrier_inn": response.offer.carrier_inn,
                "offer_price": response.offer.price,
                "offer_delivery_time": response.offer.delivery_time,
                "offer_rating": response.offer.carrier_rating,
                "status": response.get_status_display(),
                "status_code": response.status,
                "comment": response.comment,
                "created_at": response.created_at,
                "updated_at": response.updated_at
            })
        
        response_data = {
            "order_id": order.id,
            "order_info": {
                "route": f"{order.start_address} → {order.end_address}",
                "distance": order.distance,
                "cargo_weight": order.cargo.cargo_weight if order.cargo else None
            },
            "responses": response_list,
            "total_responses": len(response_list)
        }
        
    except Order.DoesNotExist:
        raise BadRequestException("Заказ с таким ID не найден")
    
    except Exception as exc:
        raise BadRequestException(f"Ошибка получения откликов по заказу: {str(exc)}")
    
    return Response(response_data, status=status_code)


@api_view(["PUT"])
def update_response_status(request, response_id):
    """Обновление статуса отклика (для админов)"""
    response_data = {}
    status_code = status.HTTP_200_OK
    
    try:
        new_status = request.data.get('status')
        comment = request.data.get('comment', '')
        
        if not new_status:
            raise BadRequestException("Не передан статус")
        
        valid_statuses = [choice[0] for choice in TransportResponse.Status.choices]
        if new_status not in valid_statuses:
            raise BadRequestException(f"Неверный статус. Доступные: {', '.join(valid_statuses)}")
        
        response = TransportResponse.objects.get(id=response_id)
        response.status = new_status
        if comment:
            response.comment = comment
        response.save()
        
        response_data = {
            "response_id": response.id,
            "offer_id": response.offer.id,
            "order_id": response.order.id,
            "carrier_name": response.offer.carrier_name,
            "status": response.get_status_display(),
            "status_code": response.status,
            "comment": response.comment,
            "updated_at": response.updated_at,
            "message": "Статус отклика обновлен"
        }
        
    except TransportResponse.DoesNotExist:
        raise BadRequestException("Отклик с таким ID не найден")
    
    except BadRequestException as exc:
        response_data["details"] = exc.response
        status_code = exc.status
    
    except Exception as exc:
        raise BadRequestException(f"Ошибка обновления статуса: {str(exc)}")
    
    return Response(response_data, status=status_code)