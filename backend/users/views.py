# backend/users/views.py
import logging

from api.serializers import UserSerializer, UserCreateSerializer
from django.contrib.auth import login, logout
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from users.models import User
from django.middleware.csrf import get_token

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def get_csrf_token(request):
    """Получение CSRF токена"""
    token = get_token(request)
    return Response({'csrfToken': token})

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def register_user(request):
    """Регистрация нового пользователя"""
    logger.info(f"Registration attempt: {request.data.get('username')}")
    serializer = UserCreateSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        logger.info(f"User registered successfully: {user.username}")
        return Response({
            'message': 'Пользователь успешно зарегистрирован',
            'user': UserSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    logger.warning(f"Registration failed: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def login_user(request):
    """Аутентификация пользователя"""
    username = request.data.get('username')
    password = request.data.get('password')

    logger.info(f"Login attempt: {username}")

    if not username or not password:
        return Response({
            'error': 'Необходимо указать логин и пароль'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(username=username)
        if not user.check_password(password):
            logger.warning(f"Invalid password for user: {username}")
            return Response({
                'error': 'Неверный логин или пароль'
            }, status=status.HTTP_401_UNAUTHORIZED)
    except User.DoesNotExist:
        logger.warning(f"User not found: {username}")
        return Response({
            'error': 'Неверный логин или пароль'
        }, status=status.HTTP_401_UNAUTHORIZED)

    login(request, user)
    logger.info(f"User logged in: {username}")
    return Response({
        'message': 'Вход выполнен успешно',
        'user': UserSerializer(user).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@csrf_exempt
def logout_user(request):
    """Выход пользователя из системы"""
    logger.info(f"User logged out: {request.user.username}")
    logout(request)
    return Response({
        'message': 'Выход выполнен успешно'
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_current_user(request):
    """Получение информации о текущем пользователе"""
    user_data = UserSerializer(request.user).data
    return Response(user_data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_users(request):
    """Получение списка пользователей (только для администраторов)"""
    if not request.user.is_admin:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)

    users = User.objects.all().order_by('-created_at')
    serializer = UserSerializer(users, many=True)

    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_user(request, user_id):
    """Удаление пользователя (только для администраторов)"""
    if not request.user.is_admin:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)

    try:
        user = User.objects.get(id=user_id)
        if user.is_admin and User.objects.filter(is_admin=True).count() == 1:
            return Response({
                'error': 'Нельзя удалить единственного администратора'
            }, status=status.HTTP_400_BAD_REQUEST)

        username = user.username
        user.delete()
        logger.info(f"User deleted by admin {request.user.username}: {username}")
        return Response({
            'message': 'Пользователь успешно удален'
        })
    except User.DoesNotExist:
        return Response({
            'error': 'Пользователь не найден'
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def update_user_admin(request, user_id):
    """Изменение статуса администратора (только для администраторов)"""
    if not request.user.is_admin:
        return Response({
            'error': 'Доступ запрещен'
        }, status=status.HTTP_403_FORBIDDEN)

    is_admin = request.data.get('is_admin')
    if is_admin is None:
        return Response({
            'error': 'Необходимо указать is_admin'
        }, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(id=user_id)
        if user.is_admin and not is_admin and User.objects.filter(is_admin=True).count() == 1:
            return Response({
                'error': 'Нельзя снять права администратора с единственного администратора'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.is_admin = is_admin
        user.save()
        logger.info(f"User admin status updated by {request.user.username}: {user.username} -> {is_admin}")
        return Response({
            'message': 'Статус администратора обновлен',
            'user': UserSerializer(user).data
        })
    except User.DoesNotExist:
        return Response({
            'error': 'Пользователь не найден'
        }, status=status.HTTP_404_NOT_FOUND)