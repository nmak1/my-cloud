# backend/storage/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import FileResponse, Http404
from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from api.serializers import (
    FileSerializer, FileUploadSerializer,
    FileRenameSerializer, FileCommentSerializer,
    ShareFileSerializer
)
from storage.models import UserFile
from users.models import User
import os
import uuid
import shutil
import logging

logger = logging.getLogger(__name__)


def get_user_storage(request, username=None):
    """Получение пользователя для работы с хранилищем"""
    if username and request.user.is_admin:
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None
    return request.user


def ensure_storage_path(user):
    """Создание директории для хранения файлов пользователя"""
    path = os.path.join(settings.MEDIA_ROOT, user.storage_path)
    os.makedirs(path, exist_ok=True)
    return path


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def list_files(request):
    """Получение списка файлов пользователя"""
    username = request.query_params.get('user')
    user = get_user_storage(request, username)

    if not user:
        return Response({
            'error': 'Пользователь не найден'
        }, status=status.HTTP_404_NOT_FOUND)

    if user != request.user and not request.user.is_admin:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)

    files = UserFile.objects.filter(user=user)
    serializer = FileSerializer(files, many=True)

    logger.info(f"Files listed for user: {user.username} by {request.user.username}")
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def upload_file(request):
    """Загрузка файла в хранилище"""
    serializer = FileUploadSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    uploaded_file = serializer.validated_data['file']
    comment = serializer.validated_data.get('comment', '')

    username = request.query_params.get('user')
    user = get_user_storage(request, username)

    if not user:
        return Response({
            'error': 'Пользователь не найден'
        }, status=status.HTTP_404_NOT_FOUND)

    if user != request.user and not request.user.is_admin:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)

    storage_path = ensure_storage_path(user)

    file_extension = os.path.splitext(uploaded_file.name)[1]
    stored_name = f"{uuid.uuid4().hex}{file_extension}"
    file_path = os.path.join(storage_path, stored_name)

    try:
        with open(file_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
    except Exception as e:
        logger.error(f"Error saving file: {str(e)}")
        return Response({
            'error': 'Ошибка при сохранении файла'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    user_file = UserFile.objects.create(
        user=user,
        original_name=uploaded_file.name,
        stored_name=stored_name,
        file_path=user.storage_path,
        file_size=uploaded_file.size,
        comment=comment
    )

    logger.info(f"File uploaded: {uploaded_file.name} by {user.username}")
    return Response(FileSerializer(user_file).data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def delete_file(request, file_id):
    """Удаление файла из хранилища"""
    try:
        user_file = UserFile.objects.get(id=file_id)
    except UserFile.DoesNotExist:
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)

    if user_file.user != request.user and not request.user.is_admin:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)

    file_deleted = False
    try:
        file_path = user_file.get_full_path()
        if os.path.exists(file_path):
            os.remove(file_path)
            file_deleted = True
        else:
            file_deleted = True
    except Exception as e:
        logger.error(f"Error deleting file: {str(e)}")
        return Response({
            'error': f'Ошибка при удалении файла: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    if file_deleted:
        user_file.delete()
        logger.info(f"File deleted: {user_file.original_name} by {request.user.username}")
        return Response({
            'message': 'Файл успешно удален'
        })
    else:
        return Response({
            'error': 'Не удалось удалить файл'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def rename_file(request, file_id):
    """Переименование файла"""
    try:
        user_file = UserFile.objects.get(id=file_id)
    except UserFile.DoesNotExist:
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)

    if user_file.user != request.user and not request.user.is_admin:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)

    serializer = FileRenameSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    new_name = serializer.validated_data['new_name']
    user_file.original_name = new_name
    user_file.save()

    logger.info(f"File renamed: {user_file.original_name} by {request.user.username}")
    return Response(FileSerializer(user_file).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def update_comment(request, file_id):
    """Изменение комментария к файлу"""
    try:
        user_file = UserFile.objects.get(id=file_id)
    except UserFile.DoesNotExist:
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)

    if user_file.user != request.user and not request.user.is_admin:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)

    serializer = FileCommentSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user_file.comment = serializer.validated_data.get('comment', '')
    user_file.save()

    logger.info(f"Comment updated for file: {user_file.original_name} by {request.user.username}")
    return Response(FileSerializer(user_file).data)


@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def share_file(request, file_id):
    """Управление публичным доступом к файлу"""
    try:
        user_file = UserFile.objects.get(id=file_id)
    except UserFile.DoesNotExist:
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)

    if user_file.user != request.user and not request.user.is_admin:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)

    serializer = ShareFileSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    user_file.is_shared = serializer.validated_data['share']
    if user_file.is_shared and not user_file.share_token:
        user_file.share_token = uuid.uuid4().hex
    elif not user_file.is_shared:
        user_file.share_token = None
    user_file.save()

    logger.info(f"File share status updated: {user_file.original_name} by {request.user.username}")
    return Response(FileSerializer(user_file).data)


@api_view(['GET'])
def download_shared_file(request, token):
    """Скачивание файла по специальной ссылке"""
    try:
        user_file = UserFile.objects.get(share_token=token, is_shared=True)
    except UserFile.DoesNotExist:
        raise Http404("Файл не найден")

    user_file.last_downloaded_at = timezone.now()
    user_file.save()

    file_path = user_file.get_full_path()
    if not os.path.exists(file_path):
        raise Http404("Файл не найден")

    logger.info(f"Shared file downloaded: {user_file.original_name} via token")
    return FileResponse(
        open(file_path, 'rb'),
        as_attachment=True,
        filename=user_file.original_name
    )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_file(request, file_id):
    """Скачивание файла пользователем"""
    try:
        user_file = UserFile.objects.get(id=file_id)
    except UserFile.DoesNotExist:
        return Response({
            'error': 'Файл не найден'
        }, status=status.HTTP_404_NOT_FOUND)

    if user_file.user != request.user and not request.user.is_admin:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)

    user_file.last_downloaded_at = timezone.now()
    user_file.save()

    file_path = user_file.get_full_path()
    if not os.path.exists(file_path):
        return Response({
            'error': 'Файл не найден на сервере'
        }, status=status.HTTP_404_NOT_FOUND)

    logger.info(f"File downloaded: {user_file.original_name} by {request.user.username}")
    return FileResponse(
        open(file_path, 'rb'),
        as_attachment=True,
        filename=user_file.original_name
    )