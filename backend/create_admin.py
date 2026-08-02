# backend/create_admin.py
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mycloud.settings')
django.setup()

from users.models import User


def create_admin():
    username = os.getenv('ADMIN_USERNAME', 'admin')
    email = os.getenv('ADMIN_EMAIL', 'admin@example.com')
    password = os.getenv('ADMIN_PASSWORD', 'Admin123!')
    full_name = os.getenv('ADMIN_FULL_NAME', 'Administrator')

    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            full_name=full_name,
            is_admin=True
        )
        print(f"Admin user '{username}' created successfully!")
    else:
        print(f"Admin user '{username}' already exists.")


if __name__ == '__main__':
    create_admin()