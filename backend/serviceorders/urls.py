from django.urls import path, include

from rest_framework.routers import DefaultRouter

from serviceorders.views import ServiceOrderViewSet


router = DefaultRouter()

router.register(r'service-orders', ServiceOrderViewSet, basename='service-orders')

urlpatterns = [
    path('', include(router.urls)),
]
