#!/bin/bash
# Script deploy AbsenNow ke server
# Jalankan dari mesin lokal: bash deploy/deploy.sh
# Atau copy ke server dan jalankan di sana

SERVER="user@absennow.jaritechnology.com"
FRONTEND_DIR="/var/www/absennow/frontend"
BACKEND_DIR="/var/www/absennow/backend"

echo "=== Build Angular (production) ==="
npm run build:prod

echo "=== Upload frontend ke server ==="
rsync -avz --delete www/ $SERVER:$FRONTEND_DIR/

echo "=== Upload backend ke server ==="
rsync -avz --delete \
  --exclude='.env' \
  --exclude='storage/app/public' \
  --exclude='vendor' \
  --exclude='node_modules' \
  absen-backend/ $SERVER:$BACKEND_DIR/

echo "=== Jalankan perintah di server ==="
ssh $SERVER "
  cd $BACKEND_DIR

  # Install dependencies
  composer install --no-dev --optimize-autoloader

  # Setup .env jika belum ada
  if [ ! -f .env ]; then
    cp /var/www/absennow/env.production .env
    php artisan key:generate
  fi

  # Migrasi & optimasi
  php artisan migrate --force
  php artisan config:cache
  php artisan route:cache
  php artisan view:cache
  php artisan storage:link

  # Reload server
  sudo systemctl reload php8.2-fpm
  sudo systemctl reload nginx
"

echo "=== Deploy selesai! ==="
echo "Web: https://absennow.jaritechnology.com"
