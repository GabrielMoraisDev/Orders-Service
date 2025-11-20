from django.contrib import admin
from django.urls import path, include


urlpatterns = [
    path('admin/', admin.site.urls),
    path('auth/', include('rest_framework.urls')),

    path('api/', include('authentication.urls')),
    path('api/v1/', include('serviceorders.urls')),
    path('api/ai/', include('aichat.urls')),
]
