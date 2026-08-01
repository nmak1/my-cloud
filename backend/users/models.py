# backend/users/models.py
from django.contrib.auth.models import AbstractUser
from django.db import models
import re

class User(AbstractUser):
    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255)
    is_admin = models.BooleanField(default=False)
    storage_path = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.storage_path:
            self.storage_path = f"users/{self.username}/"
        super().save(*args, **kwargs)

    @staticmethod
    def validate_username(username):
        pattern = r'^[A-Za-z][A-Za-z0-9]{3,19}$'
        return re.match(pattern, username) is not None

    @staticmethod
    def validate_password(password):
        pattern = r'^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$'
        return re.match(pattern, password) is not None

    @staticmethod
    def validate_email(email):
        pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return re.match(pattern, email) is not None

    class Meta:
        db_table = 'users'
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.username