// frontend/src/pages/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

function Home() {
    const { isAuthenticated } = useSelector((state) => state.auth);

    return (
        <div className="page home-page">
            <div className="hero">
                <h1>☁️ My Cloud</h1>
                <p className="subtitle">Безопасное облачное хранилище для ваших файлов</p>

                <div className="features">
                    <div className="feature">
                        <h3>📁 Храните файлы</h3>
                        <p>Загружайте и управляйте своими файлами в надежном облаке</p>
                    </div>
                    <div className="feature">
                        <h3>🔒 Безопасно</h3>
                        <p>Ваши данные защищены и доступны только вам</p>
                    </div>
                    <div className="feature">
                        <h3>📤 Делитесь</h3>
                        <p>Создавайте публичные ссылки для быстрого обмена файлами</p>
                    </div>
                </div>

                {!isAuthenticated && (
                    <div className="cta-buttons">
                        <Link to="/register" className="btn btn-primary btn-lg">
                            Начать использовать
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-lg">
                            Войти
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;