// frontend/src/pages/Register.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { register, clearError } from '../store/authSlice';

function Register() {
    const [formData, setFormData] = useState({
        username: '',
        full_name: '',
        email: '',
        password: '',
        password2: '',
    });
    const [validationErrors, setValidationErrors] = useState({});
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/storage');
        }
        return () => {
            dispatch(clearError());
        };
    }, [isAuthenticated, navigate, dispatch]);

    const validateField = (name, value) => {
        const errors = {};
        switch (name) {
            case 'username':
                if (!/^[A-Za-z][A-Za-z0-9]{3,19}$/.test(value)) {
                    errors.username = 'Логин должен содержать только латинские буквы и цифры, первый символ - буква, длина от 4 до 20 символов';
                }
                break;
            case 'email':
                if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
                    errors.email = 'Неверный формат email';
                }
                break;
            case 'password':
                if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/.test(value)) {
                    errors.password = 'Пароль должен содержать минимум 6 символов, как минимум одну заглавную букву, одну цифру и один специальный символ';
                }
                break;
            case 'password2':
                if (value !== formData.password) {
                    errors.password2 = 'Пароли не совпадают';
                }
                break;
        }
        return errors;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        const errors = validateField(name, value);
        setValidationErrors({ ...validationErrors, ...errors });
        if (Object.keys(errors).length === 0) {
            delete validationErrors[name];
            setValidationErrors(validationErrors);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Валидация всех полей
        const errors = {};
        Object.keys(formData).forEach(key => {
            const fieldErrors = validateField(key, formData[key]);
            Object.assign(errors, fieldErrors);
        });

        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors);
            return;
        }

        const { password2, ...submitData } = formData;
        const result = await dispatch(register(submitData));
        if (!result.error) {
            navigate('/storage');
        }
    };

    return (
        <div className="page auth-page">
            <div className="auth-container">
                <h2>Регистрация</h2>
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Логин *</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="Только латиница, 4-20 символов"
                            required
                        />
                        {validationErrors.username && (
                            <div className="field-error">{validationErrors.username}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Полное имя *</label>
                        <input
                            type="text"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            placeholder="Введите ваше полное имя"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Email *</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@mail.com"
                            required
                        />
                        {validationErrors.email && (
                            <div className="field-error">{validationErrors.email}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Пароль *</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Минимум 6 символов"
                            required
                        />
                        {validationErrors.password && (
                            <div className="field-error">{validationErrors.password}</div>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Подтверждение пароля *</label>
                        <input
                            type="password"
                            name="password2"
                            value={formData.password2}
                            onChange={handleChange}
                            placeholder="Повторите пароль"
                            required
                        />
                        {validationErrors.password2 && (
                            <div className="field-error">{validationErrors.password2}</div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary btn-block"
                        disabled={loading}
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                <p className="auth-link">
                    Уже есть аккаунт? <Link to="/login">Войти</Link>
                </p>
            </div>
        </div>
    );
}

export default Register;