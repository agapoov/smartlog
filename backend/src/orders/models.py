from django.db import models
from django.core.validators import MinValueValidator

from django.contrib.auth import get_user_model

User = get_user_model()

class Order(models.Model): # заказ
    """Модель заказа"""
    class OrderStatus(models.TextChoices):
        DRAFT = 'DRAFT', 'Черновик'
        POSTED = 'POSTED', 'Опубликован'
        CONFIRMATION = 'CONFIRMATION', 'Утверждение'
        COMPLETED = 'COMPLETED', 'Выполнен'
        CLOSED = 'CLOSED', 'Закрыт'

    producer = models.ForeignKey(User, on_delete=models.CASCADE, related_name="orders")

    created_at = models.DateTimeField(auto_now_add=True)

    start_address = models.CharField(max_length=255, help_text="Адрес начала маршрута")
    end_address = models.CharField(max_length=255, help_text="Адрес конца маршрута")

    distance = models.FloatField(help_text="Расстояние между адресами в километрах", null=True, blank=True)
    duration = models.FloatField(help_text="Время в пути в минутах", null=True, blank=True)

    loading_date = models.DateTimeField(help_text="Дата погрузки", null=True, blank=True)
    unloading_date = models.DateTimeField(help_text="Дата разгрузки", null=True, blank=True)

    cargo = models.ForeignKey("Cargo", on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")

    price = models.FloatField(help_text="Цена за заказ в рублях", null=True, blank=True)

    ati_id = models.BigIntegerField(
        null=True, blank=True,
        help_text="ID заказа (deal) на ATI.SU"
    )
    rools_id = models.CharField(
        null=True, blank=True,
        help_text="ID заказа на ROOLS"
    )

    status = models.CharField("Статус заказа", max_length=20, choices=OrderStatus.choices, default=OrderStatus.DRAFT)

    class Meta:
        indexes = [
            models.Index(fields=['producer', 'created_at']),
            models.Index(fields=['loading_date']),
        ]


class CargoTypeRools(models.TextChoices):
    LIQUID_BULK = 'liquid_bulk', 'Наливной'
    BREAK_BULK = 'break_bulk', 'Навалочный'
    DRY_BULK = 'dry_bulk', 'Насыпной'
    GROUPAGE = 'groupage', 'Сборный и разный груз'
    OVERSIZED = 'oversized', 'Негабаритный'
    CONTAINER = 'container', 'Контейнер'
    EUR_PALLET = 'eur_pallet', 'EUR-паллеты'
    FIN_PALLET = 'fin_pallet', 'FIN-паллеты'
    OTH_PALLET = 'oth_pallet', 'Особые паллеты'
    BAG = 'bag', 'Мешки'
    BIG_BAG = 'big_bag', 'Биг-бэги'
    ICB = 'icb', 'Еврокубы'
    CARTON = 'carton', 'Коробки'
    BARREL = 'barrel', 'Бочки'
    ROLL = 'roll', 'Рулоны'
    REEL = 'reel', 'Барабаны'
    COIL = 'coil', 'Бухта / Бунт'
    CRATE = 'crate', 'Ящики'


class Cargo(models.Model): # груз
    """Модель груза"""
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

    cargo_type = models.CharField(max_length=40, choices=CargoType.choices, default=CargoType.GENERAL)
    cargo_type_rools = models.CharField(max_length=40, null=True, blank=True, choices=CargoTypeRools.choices, default=CargoTypeRools.OVERSIZED)
    cargo_weight = models.FloatField(
        help_text="Вес груза в килограммах",
        validators=[MinValueValidator(0.1)],
        null=True, blank=True,
    )
    cargo_volume = models.FloatField(
        help_text="Объем груза в метрах кубических", 
        validators=[MinValueValidator(0.001)],
        null=True, blank=True,
    )

    quantity = models.IntegerField( # Для rools
        help_text="Количество груза",
        validators=[MinValueValidator(1)],
        null=True, blank=True,
    )

    description = models.CharField(max_length=512, help_text="Описание груза", null=True, blank=True)

    ati_id = models.BigIntegerField(
        null=True, blank=True, 
        help_text="ID груза на ATI.SU"
    )
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)


# ToDo: Сделать апи для этой модели
class CargoOrder(models.Model):
    """Модель связи заказа и груза"""
    cargo = models.ForeignKey(Cargo, on_delete=models.CASCADE)
    order = models.ForeignKey(Order, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('cargo', 'order')