from django.db import models
from django.contrib.auth import get_user_model
from orders.models import Order

User = get_user_model()

class TransportOffer(models.Model):
    """Предложение перевозчика"""
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transport_offers', null=True, blank=True, help_text="Заказ (если привязан)")
    carrier_name = models.CharField(max_length=255, help_text="Название перевозчика")
    carrier_inn = models.CharField(max_length=12, help_text="ИНН перевозчика")
    carrier_rating = models.FloatField(help_text="Рейтинг перевозчика (0-5)")
    price_per_km = models.FloatField(help_text="Цена за 1 км пути в рублях")
    delivery_time = models.IntegerField(help_text="Время доставки в часах")
    reliability_score = models.FloatField(help_text="Коэффициент надежности (0-1)")
    
    from_city = models.CharField(max_length=100, help_text="Город отправления", null=True, blank=True)
    to_city = models.CharField(max_length=100, help_text="Город назначения", null=True, blank=True)
    cargo_weight = models.FloatField(help_text="Вес груза в кг", null=True, blank=True)
    cargo_volume = models.FloatField(help_text="Объем груза в м³", null=True, blank=True)
    cargo_type = models.CharField(max_length=50, help_text="Тип груза", null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-reliability_score']

class TransportResponse(models.Model):
    """Отклик на предложение перевозчика"""
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Ожидает ответа'
        ACCEPTED = 'accepted', 'Принято'
        REJECTED = 'rejected', 'Отклонено'
        COMPLETED = 'completed', 'Завершено'
    
    offer = models.ForeignKey(TransportOffer, on_delete=models.CASCADE, related_name='responses')
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='transport_responses')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    comment = models.TextField(help_text="Комментарий перевозчика", blank=True, null=True)
    price = models.FloatField(help_text="Итоговая цена предложения", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
