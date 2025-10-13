from django.db import models
from django.core.validators import MinValueValidator

from django.contrib.auth import get_user_model

User = get_user_model()

class Order(models.Model): # заказ

    producer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")

    created_at = models.DateTimeField(auto_now_add=True)

    start_address = models.CharField(max_length=255, help_text="Адрес начала маршрута")
    end_address = models.CharField(max_length=255, help_text="Адрес конца маршрута")

    distance = models.FloatField(help_text="Расстояние между адресами в километрах")
    duration = models.FloatField(help_text="Время в пути в минутах", null=True, blank=True)

    loading_date = models.DateTimeField(help_text="Дата погрузки", null=True, blank=True)

    cargo = models.ForeignKey("Cargo", on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")

    price = models.FloatField(help_text="Цена за заказ в рублях", null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['producer', 'created_at']),
            models.Index(fields=['loading_date']),
        ]


class Cargo(models.Model): # груз
    class CargoType(models.TextChoices):
        GENERAL = 'general', 'Генеральный груз'
        BULK = 'bulk', 'Насыпной груз'
        LIQUID = 'liquid', 'Жидкий груз'
        CONTAINER = 'container', 'Контейнер'
        REFRIGERATED = 'refrigerated', 'Рефрижераторный'
        DANGEROUS = 'dangerous', 'Опасный груз'
        OVERSIZED = 'oversized', 'Крупногабаритный'
        ANIMALS = 'animals', 'Животные'
        PERISHABLE = 'perishable', 'Скоропортящийся'
        OTHER = 'other', 'Другой'

    name = models.CharField(max_length=255, help_text="Название груза")

    cargo_type = models.CharField(max_length=40, choices=CargoType.choices)
    cargo_weight = models.FloatField(
        help_text="Вес груза в килограммах",
        validators=[MinValueValidator(0.1)]
    )
    cargo_volume = models.FloatField(
        help_text="Объем груза в метрах кубических", 
        validators=[MinValueValidator(0.001)]
    )

    description = models.CharField(max_length=512, help_text="Описание груза", null=True, blank=True)
