// frontend/src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuth } from './store/authSlice';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';
import Storage from './pages/Storage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    const dispatch = useDispatch();
    const { isAuthenticated, user, loading } = useSelector((state) => state.auth);

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    // Показываем загрузку, пока проверяем аутентификацию
    if (loading) {
        return (
            <div className="app">
                <div className="loading">Загрузка приложения...</div>
            </div>
        );
    }

    return (
        <Router>
            <div className="app">
                <Navbar />
                <main className="main-content">
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute requireAdmin>
                                    <AdminPanel />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/storage/:username?"
                            element={
                                <ProtectedRoute>
                                    <Storage />
                                </ProtectedRoute>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" />} />
                    </Routes>
                </main>
            </div>
        </Router>
    );
}

export default App;