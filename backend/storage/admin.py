# backend/storage/admin.py
from django.contrib import admin
from .models import UserFile

@admin.register(UserFile)
class UserFileAdmin(admin.ModelAdmin):
    list_display = ['original_name', 'user', 'file_size', 'uploaded_at', 'is_shared']
    list_filter = ['user', 'is_shared']
    search_fields = ['original_name', 'comment']
    readonly_fields = ['stored_name', 'share_token']