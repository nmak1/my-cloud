# backend/api/urls.py
from django.urls import path, include

app_name = 'api'

urlpatterns = [
    path('auth/', include('users.urls')),
    path('storage/', include('storage.urls')),
]