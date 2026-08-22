// frontend/src/pages/AdminPanel.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, deleteUser, updateUserAdmin, clearError } from '../store/userSlice';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

function AdminPanel() {
    const dispatch = useDispatch();
    const { users, loading, error } = useSelector((state) => state.users);
    const { user: currentUser } = useSelector((state) => state.auth);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        dispatch(fetchUsers());
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const handleDeleteUser = async (userId, username) => {
        if (window.confirm(`Удалить пользователя "${username}"?`)) {
            const result = await dispatch(deleteUser(userId));
            if (!result.error) {
                dispatch(fetchUsers());
            }
        }
    };

    const handleToggleAdmin = async (userId, isAdmin) => {
        await dispatch(updateUserAdmin({ userId, isAdmin: !isAdmin }));
        dispatch(fetchUsers());
    };

    const handleViewStorage = (username) => {
        window.location.href = `/storage/${username}`;
    };

    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading && users.length === 0) {
        return <div className="loading">Загрузка пользователей...</div>;
    }

    // Подсчет статистики
    const totalUsers = users.length;
    const adminCount = users.filter(u => u.is_admin).length;
    const totalFiles = users.reduce((sum, u) => sum + (u.file_count || 0), 0);
    const totalSize = users.reduce((sum, u) => sum + (u.total_size || 0), 0);

    return (
        <div className="page admin-panel">
            <div className="admin-header">
                <h2>Панель администратора</h2>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="admin-stats">
                <div className="stat-card">
                    <div className="stat-value">{totalUsers}</div>
                    <div className="stat-label">Всего пользователей</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{adminCount}</div>
                    <div className="stat-label">Администраторов</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{totalFiles}</div>
                    <div className="stat-label">Всего файлов</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{formatFileSize(totalSize)}</div>
                    <div className="stat-label">Общий размер</div>
                </div>
            </div>

            <div className="file-list">
                <table className="file-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Логин</th>
                            <th>Полное имя</th>
                            <th>Email</th>
                            <th>Администратор</th>
                            <th>Файлов</th>
                            <th>Размер</th>
                            <th>Дата регистрации</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="file-row">
                                <td>{user.id}</td>
                                <td>
                                    <strong>{user.username}</strong>
                                </td>
                                <td>{user.full_name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <div className="user-admin-toggle">
                                        <input
                                            type="checkbox"
                                            checked={user.is_admin}
                                            onChange={() => handleToggleAdmin(user.id, user.is_admin)}
                                            disabled={user.id === currentUser?.id}
                                            title={user.id === currentUser?.id ? "Нельзя изменить свой статус" : "Изменить статус администратора"}
                                        />
                                        <span>{user.is_admin ? 'Да' : 'Нет'}</span>
                                    </div>
                                </td>
                                <td>{user.file_count || 0}</td>
                                <td>{user.total_size_mb ? `${user.total_size_mb} MB` : '0 B'}</td>
                                <td>
                                    {format(new Date(user.created_at), 'dd.MM.yyyy HH:mm', { locale: ru })}
                                </td>
                                <td className="file-actions">
                                    <button
                                        className="btn btn-sm btn-primary"
                                        onClick={() => handleViewStorage(user.username)}
                                        title="Просмотр файлов"
                                    >
                                        📁
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteUser(user.id, user.username)}
                                        disabled={user.id === currentUser?.id}
                                        title={user.id === currentUser?.id ? "Нельзя удалить себя" : "Удалить пользователя"}
                                    >
                                        ✕
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default AdminPanel;