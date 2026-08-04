# backend/storage/models.py
from django.db import models
from django.conf import settings
import os
import uuid

class UserFile(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='files')
    original_name = models.CharField(max_length=255)
    stored_name = models.CharField(max_length=255, unique=True)
    file_path = models.CharField(max_length=500)
    file_size = models.BigIntegerField()
    comment = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    last_downloaded_at = models.DateTimeField(null=True, blank=True)
    share_token = models.CharField(max_length=100, unique=True, null=True, blank=True)
    is_shared = models.BooleanField(default=False)

    def save(self, *args, **kwargs):
        if not self.stored_name:
            self.stored_name = f"{uuid.uuid4().hex}_{self.original_name}"
        if not self.share_token and self.is_shared:
            self.share_token = uuid.uuid4().hex
        super().save(*args, **kwargs)

    def get_full_path(self):
        # Исправлено: правильное объединение путей
        return os.path.join(settings.MEDIA_ROOT, str(self.file_path), str(self.stored_name))

    def get_download_url(self):
        from django.urls import reverse
        if self.is_shared and self.share_token:
            return reverse('storage:shared_download', kwargs={'token': str(self.share_token)})
        return reverse('storage:download_file', kwargs={'file_id': self.id})

    class Meta:
        db_table = 'user_files'
        verbose_name = 'Файл'
        verbose_name_plural = 'Файлы'
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.original_name} ({self.user.username})"