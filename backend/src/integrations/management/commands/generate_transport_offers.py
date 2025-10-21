from django.core.management.base import BaseCommand
from django.db import transaction
from integrations.models import TransportOffer
import random
import json
import os


class Command(BaseCommand):
    help = 'Генерирует транспортные предложения для существующих заказов'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=2000,
            help='Количество предложений для генерации (по умолчанию 2000)'
        )

    def load_carriers_data(self):
        json_path = os.path.join(
            os.path.dirname(__file__), 
            'carriers_data.json'
        )
        
        try:
            with open(json_path, 'r', encoding='utf-8') as f:
                carriers_json = json.load(f)
            
            carriers_data = []
            for carrier in carriers_json:
                name = carrier.get('name', '')
                inn = carrier.get('inn', '')
                
                base_rating = round(random.uniform(3.0, 5.0), 1)
                base_reliability = round(random.uniform(0.4, 1.0), 3)
                
                carriers_data.append((name, inn, base_rating, base_reliability))
            
            self.stdout.write(f"Загружено {len(carriers_data)} перевозчиков из JSON файла")
            return carriers_data
            
        except FileNotFoundError:
            self.stdout.write(
                self.style.WARNING(
                    f"Файл {json_path} не найден. Используем случайные данные."
                )
            )
            return []
        except json.JSONDecodeError as e:
            self.stdout.write(
                self.style.ERROR(
                    f"Ошибка чтения JSON файла: {e}. Используем случайные данные."
                )
            )
            return []
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(
                    f"Ошибка загрузки данных перевозчиков: {e}. Используем случайные данные."
                )
            )
            return []

    def handle(self, *args, **options):
        count = options['count']
        
        carriers_data = self.load_carriers_data()
        
        self.stdout.write(f"Начинаем генерацию {count} независимых предложений перевозки...")
        
        russian_cities = [
            "Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург", "Казань",
            "Нижний Новгород", "Челябинск", "Самара", "Омск", "Ростов-на-Дону",
            "Уфа", "Красноярск", "Воронеж", "Пермь", "Волгоград", "Краснодар",
            "Саратов", "Тюмень", "Тольятти", "Ижевск", "Барнаул", "Ульяновск",
            "Владивосток", "Ярославль", "Хабаровск", "Махачкала", "Томск",
            "Оренбург", "Кемерово", "Рязань", "Астрахань", "Пенза", "Липецк",
            "Тула", "Киров", "Чебоксары", "Калининград", "Брянск", "Курск",
            "Иваново", "Магнитогорск", "Тверь", "Ставрополь", "Нижний Тагил",
            "Белгород", "Архангельск", "Владимир", "Сочи", "Курган", "Смоленск",
            "Калуга", "Чита", "Орёл", "Череповец", "Мурманск", "Сургут",
            "Волжский",
            "Владикавказ", "Нальчик", "Грозный", "Петрозаводск", "Сыктывкар",
            "Йошкар-Ола", "Саранск", "Якутск", "Великий Новгород", "Псков",
            "Вологда", "Муром", "Коломна", "Элиста", "Таганрог", "Кострома",
            "Новороссийск", "Шахты", "Дзержинск", "Орск", "Нижневартовск",
            "Братск", "Ангарск", "Новокузнецк", "Прокопьевск", "Рыбинск",
            "Северодвинск", "Химки", "Мытищи", "Люберцы", "Балашиха", "Подольск",
            "Королёв", "Железнодорожный", "Зеленоград", "Волгоград",
            "Абакан", "Майкоп", "Благовещенск", "Армавир", "Кисловодск",
            "Ессентуки", "Пятигорск", "Железноводск", "Дербент", "Кузнецк",
            "Миасс", "Златоуст", "Копейск", "Камские Поляны", "Ленинск-Кузнецкий",
            "Междуреченск", "Анжеро-Судженск", "Юрга", "Бердск", "Искитим"
        ]
        
        cargo_types = [
            "general", "bulk", "liquid", "container", "refrigerated", 
            "dangerous", "oversized", "animals", "perishable", "other"
        ]
        
        with transaction.atomic():
            TransportOffer.objects.all().delete()
            self.stdout.write("Очищены существующие предложения")
            
            generated_count = 0
            
            for i in range(count):
                try:
                    from_city = random.choice(russian_cities)
                    to_city = random.choice([city for city in russian_cities if city != from_city])
                    
                    cargo_weight = round(random.uniform(100, 5000), 1)
                    cargo_volume = round(random.uniform(1, 50), 2)
                    cargo_type = random.choice(cargo_types)
                    
                    if carriers_data:
                        carrier_name, carrier_inn, base_rating, base_reliability = random.choice(carriers_data)
                        carrier_rating = round(base_rating + random.uniform(-0.5, 0.5), 1)
                        carrier_rating = max(1.0, min(5.0, carrier_rating))
                        reliability_score = round(base_reliability + random.uniform(-0.1, 0.1), 3)
                        reliability_score = max(0.1, min(1.0, reliability_score))
                    else:
                        carrier_name = f"Перевозчик {i+1}"
                        carrier_inn = f"{random.randint(1000000000, 9999999999)}"
                        carrier_rating = round(random.uniform(3.0, 5.0), 1)
                        reliability_score = round(random.uniform(0.3, 1.0), 3)
                    
                    base_price = random.uniform(5000, 250000)
                    price_variation = random.uniform(0.8, 1.3)
                    price = round(base_price * price_variation, 2)
                    
                    delivery_time = random.randint(1, 48)
                    
                    TransportOffer.objects.create(
                        order=None,
                        carrier_name=carrier_name,
                        carrier_inn=carrier_inn,
                        carrier_rating=carrier_rating,
                        price=price,
                        delivery_time=delivery_time,
                        reliability_score=reliability_score,
                        from_city=from_city,
                        to_city=to_city,
                        cargo_weight=cargo_weight,
                        cargo_volume=cargo_volume,
                        cargo_type=cargo_type
                    )
                    
                    generated_count += 1
                    
                    if generated_count % 100 == 0:
                        self.stdout.write(f"Сгенерировано {generated_count} предложений...")
                
                except Exception as e:
                    self.stdout.write(f"Ошибка при генерации предложения {i+1}: {e}")
                    continue
        
        self.stdout.write(
            f'Успешно сгенерировано {generated_count} независимых предложений перевозки!'
        )
