from rest_framework import serializers
from datetime import date
from .models import Cargo, Order
from .common import calculate_distance_haversine


class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = '__all__'


class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = '__all__'

    def validate_name(self, value):
        """Проверяем, что название груза не пустое"""
        if not value or not value.strip():
            raise serializers.ValidationError("Название груза не может быть пустым")
        return value.strip()

    def validate_cargo_weight(self, value):
        """Проверяем, что вес больше 0"""
        if value <= 0:
            raise serializers.ValidationError("Вес груза должен быть больше 0")
        return value

    def validate_cargo_volume(self, value):
        """Проверяем, что объем больше 0"""
        if value <= 0:
            raise serializers.ValidationError("Объем груза должен быть больше 0")
        return value

from django.contrib.auth import get_user_model
User = get_user_model()

class OrderCreateSerializer(OrderSerializer):
    producer = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), 
        required=False, 
        write_only=True
    )
    distance = serializers.FloatField(required=False)
    duration = serializers.FloatField(required=False)

    def create(self, validated_data):
        if 'producer' not in validated_data:
            request = self.context.get('request')
            if request and hasattr(request, 'user'):
                validated_data['producer'] = request.user
        
        if 'distance' not in validated_data:
            value = calculate_distance_haversine(self.initial_data['start_address'], self.initial_data['end_address'])
            if not value:
                raise serializers.ValidationError("Не удалось получить расстояние между городами")
            validated_data['distance'] = value
        if 'duration' not in validated_data:
            validated_data['duration'] = validated_data['distance'] / 80
        return super().create(validated_data)

    def validate_loading_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Дата загрузки не может быть в прошлом")
        return value

    def validate_start_address(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Адрес отправления не может быть пустым")
        return value.strip()

    def validate_end_address(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Адрес назначения не может быть пустым")
        return value.strip()

    def validate_price(self, value):
        if value and value <= 0:
            raise serializers.ValidationError("Цена должна быть больше 0")
        return value
