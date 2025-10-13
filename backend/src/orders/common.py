import requests
from math import radians, sin, cos, sqrt, atan2

def get_city_coordinates(city_name: str):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "q": city_name,
        "format": "json",
        "limit": 1,
    }
    headers = {
        "User-Agent": "smartlog/1.0 (contact@example.com)"
    }

    try:
        response = requests.get(url, params=params, headers=headers, timeout=5)
        if response.status_code != 200:
            print(f"[WARN] Nominatim returned status {response.status_code} for {city_name}")
            return None, None

        try:
            data = response.json()
        except ValueError:
            print(f"[WARN] Invalid JSON for city {city_name}: {response.text}")
            return None, None

        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
        else:
            print(f"[INFO] City not found: {city_name}")
            return None, None

    except requests.RequestException as e:
        print(f"[ERROR] Nominatim request failed for {city_name}: {e}")
        return None, None


def calculate_distance_haversine(city1, city2):
    """Рассчитывает расстояние между городами по прямой (в км)."""
    lat1, lon1 = get_city_coordinates(city1)
    lat2, lon2 = get_city_coordinates(city2)

    if not all([lat1, lon1, lat2, lon2]):
        return None

    R = 6371

    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)

    a = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    return R * c
