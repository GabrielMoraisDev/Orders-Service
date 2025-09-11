from rest_framework import serializers

from serviceorders.models import ServiceOrder


class ServiceOrderSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ServiceOrder
        fields = '__all__'
        read_only_fields = ['created_at', 'updated_at', 'days_delay']
