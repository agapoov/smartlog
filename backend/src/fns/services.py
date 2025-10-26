import requests
from django.conf import settings
from typing import Optional, Dict, Any


class FNSService:
    BASE_URL = "https://api-fns.ru/api/check"

    def __init__(self):
        self.api_key = getattr(settings, 'FNS_API_KEY', '')

    def get_company_info(self, ogrn: str) -> Optional[Dict[str, Any]]:
        """
        Получение информации об организации по ОГРН
        """
        if not self.api_key:
            raise ValueError("FNS API key not configured")

        params = {
            'req': ogrn,
            'key': self.api_key
        }

        try:
            response = requests.get(self.BASE_URL, params=params, timeout=30)
            response.raise_for_status()

            data = response.json()
            return self._parse_response(data)

        except requests.exceptions.RequestException as e:
            print(f"FNS API request failed: {e}")
            return None
        except ValueError as e:
            print(f"FNS API response parsing failed: {e}")
            return None

    def _parse_response(self, data: Dict) -> Dict[str, Any]:
        """
        Парсинг ответа от API ФНС
        """
        if not data.get('items'):
            return {'error': 'No data found'}

        # Базовый парсинг ответа, можно адаптировать под ваши нужды
        item = data['items'][0]

        result = [{"Позитив": info.get("Позитив", {}), "Негатив": info.get("Негатив", {})} for type_org, info in item.items()]
        return result[0]