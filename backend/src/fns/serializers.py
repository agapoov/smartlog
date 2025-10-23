from rest_framework import serializers

class FNSRequestSerializer(serializers.Serializer):
    ogrn = serializers.CharField(max_length=15, min_length=13)