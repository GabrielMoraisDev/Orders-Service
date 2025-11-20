#!/bin/bash

set -e

echo "🚀 Iniciando Backend Django..."

echo "⏳ Aguardando banco de dados PostgreSQL..."
while ! nc -z ${POSTGRES_HOST:-db} 5432; do
  sleep 0.1
done
echo "✅ Banco de dados disponível!"

echo "📦 Aplicando migrações..."
python manage.py migrate --noinput

echo "📂 Coletando arquivos estáticos..."
python manage.py collectstatic --noinput

echo "👤 Criando superusuário se não existir..."
python manage.py shell << END
from django.contrib.auth import get_user_model
import os
User = get_user_model()
username = os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin')
email = os.environ.get('DJANGO_SUPERUSER_EMAIL', 'admin@example.com')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD', 'admin123')
if not User.objects.filter(username=username).exists():
    User.objects.create_superuser(username, email, password)
    print(f'✅ Superusuário criado: {username}/{password}')
else:
    print('ℹ️  Superusuário já existe')
END

echo "🌐 Iniciando servidor Django na porta 8000..."
exec python manage.py runserver 0.0.0.0:8000
