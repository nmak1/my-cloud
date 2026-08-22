// frontend/src/components/Navbar.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { clearFiles } from '../store/fileSlice';

function Navbar() {
    const { isAuthenticated, user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await dispatch(logout());
        dispatch(clearFiles());
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="nav-container">
                <Link to="/" className="nav-brand">
                    ☁️ My Cloud
                </Link>
                <ul className="nav-menu">
                    <li>
                        <Link to="/">Главная</Link>
                    </li>
                    {isAuthenticated && (
                        <>
                            <li>
                                <Link to="/storage">Мои файлы</Link>
                            </li>
                            {user?.is_admin && (
                                <li>
                                    <Link to="/admin">Админ панель</Link>
                                </li>
                            )}
                        </>
                    )}
                </ul>
                <div className="nav-actions">
                    {isAuthenticated ? (
                        <div className="user-info">
                            <span className="username">{user?.full_name || user?.username}</span>
                            <button onClick={handleLogout} className="btn btn-outline">
                                Выйти
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-primary">
                                Войти
                            </Link>
                            <Link to="/register" className="btn btn-secondary">
                                Регистрация
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;