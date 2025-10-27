from datetime import datetime

import pytz
import requests
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from orders.models import Cargo, Order, CargoOrder
from src.settings import ROOLS_API_KEY

ROOLS_BASE = "https://api.test.roolz.tech/"

@api_view(['GET'])
def get_geo_info(request, **kwargs):
    """
    Поиск гео объектов в системе rools.
    Допускается поиск по наименованиям, а также по координатам
    Обязательный параметр: search
    """

    search = request.GET.get('search')
    if not search:
        return Response(
            {"details": "Параметр search обязателен для поиска"},
            status=status.HTTP_400_BAD_REQUEST
        )

    url = f'{ROOLS_BASE}public-api/v1/system/geo-search/?q={search}&apikey={ROOLS_API_KEY}'

    try:
        resp = requests.get(url)
        resp.raise_for_status()
    except requests.RequestException as e:
        return Response(
            {"details": "Ошибка при получении данных от API ROOLS"},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = resp.json()
    result = [item.get('properties') for item in data]

    return Response(result)


@api_view(['POST'])
def post_order(request, **kwargs):
    """
    API для публикации заказа на портале rools
    Данные локаций берём из апи api/integrations/rools/geo_search/?search=ивня
    Пример тела:
    {
        "loading_location": { // Локация погрузки
            "id": 1,
            "type": "R",
            "position_type": "city",
            "name": "Белгород"
        },
        "loading_start_datetime": { // Время погрузки
            "date": "2026-10-30",
            "time_zone": "Europe/Moscow",
            "time": "10:10:10"
        },
        "unloading_location": { // Локация разгрузки
            "id": 1,
            "type": "R",
            "position_type": "city",
            "name": "Москва"
        },
        "unloading_start_datetime": { // Время разгрузки
            "date": "2026-11-01",
            "time_zone": "Europe/Moscow",
            "time": "10:10:10"
        },
        "lifetime": 86400, // Время публикации в секундах (по дефолту день)
        "price": 100, // Цена в рублях
        "cargo_units": [{
            "name": "Первый заказ", // Время заказа
            "type": "bag", // Тип груза, варианты можно получить по апи GET /api/cargo_type_rools/
            "quantity": 10, // Количество груза
            "volume": 1.1, // Объём, метры кубические
            "weight": 1.1, // Вес, килограммы (не менее 10 кг)
            "description": "Хрупкое" // Описание
        }]
    }
    """
    data = request.data.copy()

    loading_datetime_str = f"{data['loading_start_datetime']['date']}T{data['loading_start_datetime']['time']}"
    timezone = pytz.timezone(data['loading_start_datetime']['time_zone'])
    loading_aware_datetime = timezone.localize(datetime.fromisoformat(loading_datetime_str))

    order_data = {
        "producer": request.user,
        "start_address": data["loading_location"]["name"],
        "end_address": data["unloading_location"]["name"],
        "loading_date": loading_aware_datetime,
        "price": data.get("price"),
    }

    order, created = Order.objects.get_or_create(**order_data)
    print(f"[INFO] Создан заказ {order}")

    base_cargo_data = [{
        "cargo_type_rools": cargo["type"],
        "name": cargo["name"],
        "cargo_weight": cargo["weight"],
        "cargo_volume": cargo["volume"],
        "quantity": cargo["quantity"],
        "description": cargo["quantity"],
    } for cargo in data.get("cargo_units", [])]

    created_count = 0
    for cargo in base_cargo_data:
        cargo, created = Cargo.objects.get_or_create(
            name=cargo["name"],
            cargo_weight=cargo["cargo_weight"],
            cargo_volume=cargo["cargo_volume"],
            quantity=cargo["quantity"],
            defaults=cargo,
        )
        if created:
            created_count += 1

        CargoOrder.objects.get_or_create(cargo=cargo, order=order)

    print(f"[INFO] Создано {created_count} грузов")

    url = f'https://api.test.roolz.tech/public-api/v1/exchange/offer/?apikey={ROOLS_API_KEY}'
    payload = {
        "status": "not_published",
        "type": "cargo",
        "is_public": True,
        "is_private": False,
        "payment": {
            "quote_is_vat": True,
            "is_prepay": False,
            "bid_is_vat": True,
            "bid_is_not_vat": True,
            "bid_is_not_unique": True,
            "currency": "RUB",
            "quote": data.get("price"),
            "payment_condition": "deferred_upon_originals",
            "payment_method": "mixed",
            "bid_mode": "ad"
        },
        "route": [
            {
                "order": 1,
                "point_type": "loading",
                "time_zone": "0",
                "location": {
                    "id": data.get("loading_location").get("id"),
                    "is_radius": False,
                    "type": data.get("loading_location").get("type"),
                    "position_type": data.get("loading_location").get("position_type"),
                },
                "start_datetime": data.get("loading_start_datetime", {}),
            },
            {
                "order": 2,
                "point_type": "unloading",
                "time_zone": "0",
                "location": {
                    "id": data.get("unloading_location").get("id"),
                    "is_radius": False,
                    "type": data.get("unloading_location").get("type"),
                    "position_type": data.get("unloading_location").get("position_type")
                },
                "start_datetime": data.get("unloading_start_datetime", {}),
            }
        ],
        "transportation_requirement": {
            "is_trailer_interchange": True,
            "shipping_mode": "any",
            "type": "any",
            "body": [
                "curtainside"
            ],
            "equipment": [
                "mode_any"
            ],
            "quantity": 1,
        },
        "publication_lifetime": {
            "lifetime": data.get("lifetime", 86400),
            "is_first_bid": True
        },
        "bid_privacy": {
            "allow_view_bidder": True,
            "allow_view_quote": True,
            "allow_view_comment": True
        },
        "cargo_units": [
            {
                "name": cargo.get("name"),
                "type": cargo.get("type"),
                "quantity": cargo.get("quantity"),
                "weight": cargo.get("weight") / 1000, # rools работают с тоннами
                "volume": cargo.get("volume")
            } for cargo in data.get("cargo_units", [])
        ]
    }

    print(f"[INFO] Отправляем запрос на ROOLS")
    try:
        resp = requests.post(url, json=payload, timeout=10)
        print(f"[DEBUG] Статус ответа: {resp.status_code}")
        resp.raise_for_status()
    except requests.RequestException as e:
        error_text = resp.text if 'resp' in locals() else 'No response'
        print(f"[ERROR] Не удалось создать груз: {e}")
        print(f"[ERROR] Response: {error_text}")
        return Response(
            {"details": f"Ошибка получения данных от ROOLS: {e}"},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = resp.json()

    rools_id = data.get("offer", {}).get("id")
    order.rools_id = rools_id
    order.save()

    return Response(
        {"message": "Заказ успешно размещён"},
        status=status.HTTP_200_OK
    )

@api_view(['GET'])
def rools_order_status(request):
    url = f"{ROOLS_BASE}public-api/v1/system/offers/statuses/?apikey={ROOLS_API_KEY}"

    try:
        resp = requests.get(url)
        resp.raise_for_status()
    except requests.RequestException as e:
        return Response(
            {"details": "Ошибка при получении данных от API ROOLS"},
            status=status.HTTP_400_BAD_REQUEST
        )

    data = resp.json()

    return Response(data)