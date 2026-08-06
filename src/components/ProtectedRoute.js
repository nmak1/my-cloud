// frontend/src/components/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function ProtectedRoute({ children, requireAdmin = false }) {
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

    // Показываем загрузку, пока проверяем аутентификацию
    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    // Если пользователь не авторизован - перенаправляем на логин
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Если требуется роль администратора
    if (requireAdmin && !user?.is_admin) {
        return <Navigate to="/" replace />;
    }

    return children;
}

export default ProtectedRoute;