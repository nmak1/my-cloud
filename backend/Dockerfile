# backend/Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Create media directories
RUN mkdir -p /app/media/storage

# Run migrations and create admin user
RUN python manage.py makemigrations users storage && \
    python manage.py migrate

# Create superuser if not exists (will be executed at runtime)
COPY create_admin.py /app/
RUN python create_admin.py

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]