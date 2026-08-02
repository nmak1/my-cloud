# My Cloud - Облачное хранилище

## Описание проекта
Веб-приложение для облачного хранения файлов с возможностью управления пользователями и файлами.

## Функциональность
### Пользовательская часть
- Регистрация с валидацией данных
- Аутентификация
- Загрузка файлов с комментариями
- Просмотр списка файлов
- Скачивание файлов
- Переименование файлов
- Удаление файлов
- Изменение комментариев
- Публичный доступ к файлам через специальные ссылки

### Административная часть
- Управление пользователями
- Назначение прав администратора
- Просмотр статистики по файлам пользователей
- Доступ к хранилищам всех пользователей

## Технологии
### Бэкенд
- Python 3.10+
- Django 4.2
- PostgreSQL 15
- Django REST Framework
- Session-based authentication

### Фронтенд
- React 18
- Redux Toolkit
- React Router 6
- Webpack 5
- CSS3

### Инфраструктура
- Docker & Docker Compose
- Nginx (для продакшн)

## Установка и запуск

### Локальная разработка

#### 1. Клонирование репозитория
```bash
git clone https://github.com/yourusername/my-cloud.git
cd my-cloud
```
2. Настройка бэкенда
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```
# Создание .env файла
```bash
cp .env.example .env
```

# Отредактируйте .env файл с вашими настройками
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```
3. Настройка фронтенда
```bash
cd frontend
npm install
npm start
```
Запуск через Docker
```bash
docker-compose up -d
Приложение будет доступно:

Фронтенд: http://localhost:3000

Бэкенд API: http://localhost:8000/api
```
Структура проекта
```text
my-cloud/
├── backend/
│   ├── api/              # API приложения
│   ├── users/            # Модели и представления пользователей
│   ├── storage/          # Модели и представления файлов
│   ├── mycloud/          # Основные настройки Django
│   ├── manage.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/   # React компоненты
│   │   ├── pages/        # Страницы приложения
│   │   ├── store/        # Redux store
│   │   ├── services/     # API сервисы
│   │   ├── styles/       # CSS стили
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   ├── webpack.config.js
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```
API Документация   
Аутентификация
```bash
POST /api/auth/register/ - Регистрация пользователя

POST /api/auth/login/ - Вход в систему

POST /api/auth/logout/ - Выход из системы

GET /api/auth/me/ - Информация о текущем пользователе
```
Пользователи (только администратор)
```bash
GET /api/auth/users/ - Список пользователей

DELETE /api/auth/users/<id>/ - Удаление пользователя

PATCH /api/auth/users/<id>/admin/ - Изменение статуса администратора
```
Файлы
```bash
GET /api/storage/files/ - Список файлов

POST /api/storage/files/upload/ - Загрузка файла

DELETE /api/storage/files/<id>/ - Удаление файла

PATCH /api/storage/files/<id>/rename/ - Переименование

PATCH /api/storage/files/<id>/comment/ - Изменение комментария

PATCH /api/storage/files/<id>/share/ - Управление публичным доступом

GET /api/storage/files/<id>/download/ - Скачивание файла

GET /api/storage/shared/<token>/ - Скачивание по публичной ссылке
```
Переменные окружения   
Бэкенд (.env)
```text
DEBUG=True
SECRET_KEY=your-secret-key
DB_NAME=mycloud_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
FILE_STORAGE_PATH=/path/to/storage
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=Admin123!
```

Фронтенд
```text
REACT_APP_API_URL=/api
```
Развертывание на reg.ru
```
Создайте виртуальный сервер на reg.ru

Установите Docker и Docker Compose

Скопируйте проект на сервер

Настройте переменные окружения для продакшн

Запустите с помощью docker-compose
```
Тестирование

### Бэкенд
```bash
python manage.py test
```
### Фронтенд
```bash
npm test
```
Лицензия  
MIT

Автор
Николай Макаров



## Заключение

``` text 
Проект полностью реализован и включает:

1. **Бэкенд на Django**:
   - Модели пользователей и файлов
   - Полный REST API
   - Аутентификация через сессии
   - Административная панель
   - Работа с файловой системой

2. **Фронтенд на React**:
   - SPA приложение
   - Redux для управления состоянием
   - React Router для навигации
   - Drag-and-drop загрузка файлов
   - Адаптивный интерфейс

3. **Инфраструктура**:
   - Docker контейнеризация
   - PostgreSQL база данных
   - Готовые скрипты для развертывания

4. **Функциональность**:
   - Регистрация и аутентификация
   - Управление файлами (загрузка, переименование, удаление, комментарии)
   - Публичные ссылки на файлы
   - Администрирование пользователей

Для развертывания на reg.ru следуйте инструкции в README.md. Проект готов к продакшн использованию.
``` 