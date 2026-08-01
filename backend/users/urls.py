# backend/users/urls.py
from django.urls import path
from . import views

app_name = 'users'

urlpatterns = [
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),
    path('users/', views.get_users, name='users'),
    path('users/<int:user_id>/', views.delete_user, name='delete_user'),
    path('users/<int:user_id>/admin/', views.update_user_admin, name='update_admin'),
    path('me/', views.get_current_user, name='current_user'),
]