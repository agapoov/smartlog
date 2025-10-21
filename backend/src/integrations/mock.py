
import random
from .models import TransportOffer

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
        
        base_price = order.distance * 50 + order.cargo.cargo_weight * 2
        price_variation = random.uniform(0.8, 1.3)
        price = round(base_price * price_variation, 2)
        
        base_time = int(order.distance / 60)
        delivery_time = base_time + random.randint(-2, 4)
        delivery_time = max(1, delivery_time)
        
        reliability_score = round(
            (carrier_rating / 5.0) * 0.6 +
            random.uniform(0.2, 0.4),
            3
        )
        reliability_score = min(1.0, reliability_score)
        
        offer = TransportOffer.objects.create(
            order=order,
            carrier_name=carrier_name,
            carrier_inn=f"{random.randint(1000000000, 9999999999)}",
            carrier_rating=carrier_rating,
            price=price,
            delivery_time=delivery_time,
            reliability_score=reliability_score
        )
        offers.append(offer)
    
    return offers

def calculate_offer_coefficient(offer, order=None):
    """Вычисляет коэффициент качества предложения"""
    
    if offer.order:
        order_price = offer.order.price or 100000
    elif order:
        order_price = order.price or 100000
    else:
        order_price = offer.price * 1.2
    
    price_score = 1.0 - (offer.price / order_price)
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
    
    offers = matching_offers.order_by('-reliability_score', 'price')[:limit]
    
    result = []
    for offer in offers:
        coefficient = calculate_offer_coefficient(offer, order)
        
        if offer.order:
            order_price = offer.order.price or 100000
        elif order:
            order_price = order.price or 100000
        else:
            order_price = offer.price * 1.2
        
        price_score = max(0, min(1, 1.0 - (offer.price / order_price)))
        rating_score = offer.carrier_rating / 5.0
        
        base_expected_time = 24
        time_score = min(1, base_expected_time / offer.delivery_time if offer.delivery_time > 0 else 0)
        
        result.append({
            'id': offer.id,
            'carrier_name': offer.carrier_name,
            'carrier_inn': offer.carrier_inn,
            'carrier_rating': offer.carrier_rating,
            'price': offer.price,
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