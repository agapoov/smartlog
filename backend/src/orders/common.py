import requests
from math import radians, sin, cos, sqrt, atan2

def get_city_coordinates(city_name: str):
    # Список бесплатных геокодинг API
    providers = [
        {
            "name": "Nominatim",
            "url": "https://nominatim.openstreetmap.org/search",
            "params": {"q": city_name, "format": "json", "limit": 1},
            "headers": {"User-Agent": "smartlog/1.0 (contact@example.com)"},
            "parser": lambda data: (float(data[0]["lat"]), float(data[0]["lon"])) if data else (None, None)
        },
        {
            "name": "Photon",
            "url": "https://photon.komoot.io/api/",
            "params": {"q": city_name, "limit": 1},
            "headers": {},
            "parser": lambda data: (float(data["features"][0]["geometry"]["coordinates"][1]), 
                                   float(data["features"][0]["geometry"]["coordinates"][0])) 
                                   if data.get("features") else (None, None)
        },
        {
            "name": "Geocode.maps.co",
            "url": "https://geocode.maps.co/search",
            "params": {"q": city_name, "format": "json", "limit": 1},
            "headers": {},
            "parser": lambda data: (float(data[0]["lat"]), float(data[0]["lon"])) if data else (None, None)
        }
    ]

    for provider in providers:
        try:
            response = requests.get(
                provider["url"], 
                params=provider["params"], 
                headers=provider["headers"], 
                timeout=5
            )
            
            # Если 403 или другая ошибка - пробуем следующий провайдер
            if response.status_code == 403:
                print(f"[WARN] {provider['name']} blocked (403) for {city_name}, trying next provider...")
                continue
            
            if response.status_code != 200:
                print(f"[WARN] {provider['name']} returned status {response.status_code} for {city_name}")
                continue

            try:
                data = response.json()
            except ValueError:
                print(f"[WARN] Invalid JSON from {provider['name']} for {city_name}")
                continue

            lat, lon = provider["parser"](data)
            if lat and lon:
                print(f"[INFO] Coordinates for {city_name} found via {provider['name']}")
                return lat, lon
            else:
                print(f"[INFO] City not found in {provider['name']}: {city_name}")
                continue

        except requests.RequestException as e:
            print(f"[ERROR] {provider['name']} request failed for {city_name}: {e}")
            continue

    print(f"[ERROR] All geocoding providers failed for {city_name}")
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
