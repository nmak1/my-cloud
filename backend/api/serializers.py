# backend/api/serializers.py
from rest_framework import serializers
from users.models import User
from storage.models import UserFile
import os

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'is_admin', 'created_at', 'storage_path']
        read_only_fields = ['id', 'created_at', 'storage_path']

class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'full_name', 'password']

    def validate_username(self, value):
        if not User.validate_username(value):
            raise serializers.ValidationError(
                "Логин должен содержать только латинские буквы и цифры, "
                "первый символ - буква, длина от 4 до 20 символов"
            )
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Пользователь с таким логином уже существует")
        return value

    def validate_email(self, value):
        if not User.validate_email(value):
            raise serializers.ValidationError("Неверный формат email")
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Пользователь с таким email уже существует")
        return value

    def validate_password(self, value):
        if not User.validate_password(value):
            raise serializers.ValidationError(
                "Пароль должен содержать минимум 6 символов, "
                "как минимум одну заглавную букву, одну цифру и один специальный символ"
            )
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            full_name=validated_data['full_name'],
            password=validated_data['password']
        )
        return user

class FileSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    file_size_mb = serializers.SerializerMethodField()
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = UserFile
        fields = [
            'id', 'user', 'original_name', 'stored_name',
            'file_size', 'file_size_mb', 'comment',
            'uploaded_at', 'last_downloaded_at',
            'is_shared', 'share_token', 'download_url'
        ]
        read_only_fields = ['id', 'stored_name', 'uploaded_at', 'share_token']

    def get_file_size_mb(self, obj):
        return round(obj.file_size / (1024 * 1024), 2)

    def get_download_url(self, obj):
        return obj.get_download_url()

class FileUploadSerializer(serializers.Serializer):
    file = serializers.FileField()
    comment = serializers.CharField(required=False, allow_blank=True)

class FileRenameSerializer(serializers.Serializer):
    new_name = serializers.CharField(max_length=255)

class FileCommentSerializer(serializers.Serializer):
    comment = serializers.CharField(required=False, allow_blank=True)

class ShareFileSerializer(serializers.Serializer):
    share = serializers.BooleanField()