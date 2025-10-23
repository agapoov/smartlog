import requests
from src.settings import ATI_SU_API_KEY
from datetime import datetime
from orders.common import get_city_coordinates

ATI_BASE = "https://api.ati.su"



def get_location_id(city_name: str):
    """
    Получение ATI ID и типа локации по названию города через координаты.
    """

    lat, lon = get_city_coordinates(city_name)
    if lat is None or lon is None:
        print(f"[WARN] Не удалось получить координаты для {city_name}")
        return None

    url = f"{ATI_BASE}/gw/gis-dict/v1/cities/by-coordinate"
    headers = {"Authorization": f"Bearer {ATI_SU_API_KEY}", "Content-Type": "application/json"}
    payload = {"location": {"lat": lat, "lon": lon}}

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=5)
        resp.raise_for_status()
    except requests.RequestException as e:
        print(f"[ERROR] ATI API request failed: {e}")
        return None

    data = resp.json()
    
    if not data:
        print(f"[WARN] ATI не вернул данные для {city_name}")
        return None
    
    city_id = data.get("city_id") or data.get("id") or data.get("location_id")
    if not city_id:
        print(f"[WARN] ATI не вернул ID для {city_name}. Доступные поля: {list(data.keys())}")
        return None

    return {"id": city_id, "type": "city"}


def create_cargo(order, ati_user_id = 4142939):
    from_loc = get_location_id(order.start_address)
    to_loc = get_location_id(order.end_address)
    if not from_loc or not to_loc:
        print("[ERROR] Не удалось определить локации для груза.")
        return None

    url = f"{ATI_BASE}/v2/cargos"
    headers = {"Authorization": f"Bearer {ATI_SU_API_KEY}", "Content-Type": "application/json"}

    payload = {
        "cargo_application": {
            "external_id": str(order.id),
            "route": {
                "loading": {"location": {"id": from_loc["id"]}},
                "unloading": {"location": {"id": to_loc["id"]}},
                "way_points": []
            },
            "truck": {
                "trucks_count": 1,
                "load_type": "ftl",
                "body_types": [1],
                "body_loading": {"types": [1], "is_all_required": False},
                "body_unloading": {"types": [1], "is_all_required": False},
                "required_capacity": order.cargo.cargo_weight / 1000.0
            },
            "payment": {"type": "with-bargaining"},
            "boards": [{"id": "public", "publication_mode": "now"}],
            "contacts": [ati_user_id],
            "note": order.cargo.description or "",
            "cargo_name": order.cargo.name,
            "cargo_type": order.cargo.cargo_type,
            "loading_date": order.loading_date.isoformat() if order.loading_date else datetime.now().isoformat(),
            "weight": order.cargo.cargo_weight,
            "volume": order.cargo.cargo_volume
        }
    }

    print(f"[DEBUG] Отправляем payload: {payload}")
    
    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        print(f"[DEBUG] Статус ответа: {resp.status_code}")
        print(f"[DEBUG] Заголовки ответа: {dict(resp.headers)}")
        resp.raise_for_status()
    except requests.RequestException as e:
        error_text = resp.text if 'resp' in locals() else 'No response'
        print(f"[ERROR] Не удалось создать груз: {e}")
        print(f"[ERROR] Response: {error_text}")
        return None

    try:
        data = resp.json()
        print(f"[DEBUG] Ответ от ATI: {data}")
    except ValueError as e:
        print(f"[ERROR] Не удалось распарсить JSON ответ: {e}")
        print(f"[ERROR] Response text: {resp.text}")
        return None

    cargo_id = data.get("id")
    if cargo_id:
        print(f"[OK] Груз создан на ATI. ID: {cargo_id}")
        return cargo_id
    print(f"[WARN] ATI API не вернул ID груза: {data}")
    return None

def create_order(order):
    from_location = get_location_id(order.start_address)
    to_location = get_location_id(order.end_address)

    if not from_location or not to_location:
        print("[ERROR] Не удалось определить локации для заказа.")
        return None, None

    cargo_id = create_cargo(order)
    if not cargo_id:
        print("[ERROR] Не удалось создать груз, заказ не создан.")
        return None, None

    url = f"{ATI_BASE}/v2/orders"
    headers = {"Authorization": f"Bearer {ATI_SU_API_KEY}", "Content-Type": "application/json"}

    payload = {
        "cargo_id": cargo_id,
        "from": {"id": from_location["id"]},
        "to": {"id": to_location["id"]},
        "loading_date": order.loading_date.isoformat() if order.loading_date else datetime.now().isoformat(),
        "price": order.price
    }

    try:
        resp = requests.post(url, headers=headers, json=payload, timeout=10)
        resp.raise_for_status()
    except requests.RequestException as e:
        error_text = resp.text if 'resp' in locals() else 'No response'
        print(f"[ERROR] Не удалось создать заказ: {e}")
        print(f"[ERROR] Response: {error_text}")
        return cargo_id, None

    try:
        data = resp.json()
    except ValueError as e:
        print(f"[ERROR] Не удалось распарсить JSON ответ: {e}")
        print(f"[ERROR] Response text: {resp.text}")
        return cargo_id, None

    deal_id = data.get("deal_id")
    if not deal_id:
        print(f"[WARN] ATI API не вернул ID заказа: {data}")
        return cargo_id, None

    print(f"[OK] Заказ создан на ATI. Deal ID: {deal_id}")
    return cargo_id, deal_id
