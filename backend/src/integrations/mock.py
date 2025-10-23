
import random
import math
from .models import TransportOffer

def calculate_dynamic_price(offer, order):
    """
    динамический рассчет цены, на основе дистанции между точками, 
    тарифа предложения за 1км, и остального
    """
    if not order or not order.distance:
        return 0
    
    base_rate_per_km = offer.price_per_km
    
    rating_modifier = 1 + (offer.carrier_rating - 3.0) * 0.1  # ±20% за рейтинг
    reliability_modifier = 1 + (offer.reliability_score - 0.7) * 0.2  # ±6% за надежность
    
    weight_modifier = 1 + (offer.cargo_weight / 5000) * 0.3 if offer.cargo_weight else 1
    
    base_price = order.distance * base_rate_per_km
    final_price = base_price * rating_modifier * reliability_modifier * weight_modifier
    
    return round(final_price, 2)

def generate_mock_offers(order, count=5):
    """Генерирует mock предложения перевозчиков для заказа"""
    
    carrier_names = [
        "ООО 'Быстрая доставка'",
        "ИП Иванов И.И.",
        "Транспортная компания 'Скорость'",
        "ООО 'Надежный перевозчик'",
        "ИП Петров П.П.",
        "ТК 'Экспресс'",
        "ООО 'Грузовик-Сервис'",
        "ИП Сидоров С.С."
    ]
    
    offers = []
    
    for _ in range(count):
        carrier_name = random.choice(carrier_names)
        carrier_rating = round(random.uniform(3.0, 5.0), 1)
        
        base_time = int(order.distance / 60)
        delivery_time = base_time + random.randint(-2, 4)
        delivery_time = max(1, delivery_time)
        
        reliability_score = round(
            (carrier_rating / 5.0) * 0.6 +
            random.uniform(0.2, 0.4),
            3
        )
        reliability_score = min(1.0, reliability_score)
        
        price_per_km = round(random.uniform(30, 60), 2)
        
        offer = TransportOffer.objects.create(
            order=order,
            carrier_name=carrier_name,
            carrier_inn=f"{random.randint(1000000000, 9999999999)}",
            carrier_rating=carrier_rating,
            price_per_km=price_per_km,
            delivery_time=delivery_time,
            reliability_score=reliability_score
        )
        offers.append(offer)
    
    return offers

def calculate_offer_coefficient(offer, order=None):
    """Вычисляет коэффициент качества предложения"""
    
    dynamic_price = calculate_dynamic_price(offer, order)
    
    if order and order.price:
        order_price = order.price
    else:
        order_price = order.distance * 45
    
    price_score = 1.0 - (dynamic_price / order_price)
    price_score = max(0, min(1, price_score))
    
    rating_score = offer.carrier_rating / 5.0
    
    base_expected_time = 24
    time_score = base_expected_time / offer.delivery_time if offer.delivery_time > 0 else 0
    time_score = min(1, time_score)
    
    coefficient = (
        price_score * 0.3 +      # 30% цена
        rating_score * 0.4 +     # 40% рейтинг
        time_score * 0.2 +       # 20% время
        offer.reliability_score * 0.1  # 10% надежность
    )
    
    return round(coefficient, 3)

def get_top_offers(order, limit=5):
    """Получает топ предложений для заказа из независимых предложений"""
    
    matching_offers = TransportOffer.objects.filter(
        order__isnull=True,  # Независимые предложения
        from_city__icontains=order.start_address.split(',')[0].strip(),
        to_city__icontains=order.end_address.split(',')[0].strip(),
    )
    
    if not matching_offers.exists():
        matching_offers = TransportOffer.objects.filter(
            order__isnull=True,
            from_city__icontains=order.start_address.split(',')[0].strip(),
        )
    
    if not matching_offers.exists():
        matching_offers = TransportOffer.objects.filter(order__isnull=True)
    
    if not matching_offers.exists():
        generate_mock_offers(order, limit)
        matching_offers = TransportOffer.objects.filter(order=order)
    
    offers = matching_offers.order_by('-reliability_score', 'carrier_rating')[:limit]
    
    result = []
    for offer in offers:
        dynamic_price = calculate_dynamic_price(offer, order)
        
        coefficient = calculate_offer_coefficient(offer, order)
        
        if order and order.price:
            order_price = order.price
        else:
            # Используем среднюю цену рынка для сравнения (45 руб/км)
            order_price = order.distance * 45
        
        price_score = max(0, min(1, 1.0 - (dynamic_price / order_price)))
        rating_score = offer.carrier_rating / 5.0
        
        base_expected_time = 24
        time_score = min(1, base_expected_time / offer.delivery_time if offer.delivery_time > 0 else 0)
        
        result.append({
            'id': offer.id,
            'carrier_name': offer.carrier_name,
            'carrier_inn': offer.carrier_inn,
            'carrier_rating': offer.carrier_rating,
            'price': dynamic_price,  # Динамическая цена
            'delivery_time': offer.delivery_time,
            'reliability_score': offer.reliability_score,
            'coefficient': coefficient,
            'coefficient_breakdown': {
                'price_score': round(price_score, 3),
                'rating_score': round(rating_score, 3),
                'time_score': round(time_score, 3),
                'reliability_score': round(offer.reliability_score, 3),
                'explanation': {
                    'price': f"Цена: {price_score:.1%} (чем дешевле, тем лучше)",
                    'rating': f"Рейтинг: {rating_score:.1%} ({offer.carrier_rating}/5 звезд)",
                    'time': f"Время: {time_score:.1%} (доставка за {offer.delivery_time}ч)",
                    'reliability': f"Надежность: {offer.reliability_score:.1%} (история доставок)"
                }
            }
        })
    
    return result