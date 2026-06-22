#!/bin/sh
set -e
cd /var/www/html

# Only the main app container (php-fpm) runs DB migrations & caching.
# The queue worker reuses this image but passes a different command, so it skips.
if [ "$1" = "php-fpm" ]; then
    # Ensure the storage volume is writable (named volume may reset ownership)
    chown -R www-data:www-data storage bootstrap/cache 2>/dev/null || true

    echo "Waiting for database ${DB_HOST}:${DB_PORT:-5432} ..."
    until php -r "new PDO('pgsql:host='.getenv('DB_HOST').';port='.(getenv('DB_PORT') ?: 5432).';dbname='.getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD'));" 2>/dev/null; do
        sleep 2
    done
    echo "Database is up."

    php artisan migrate --force
    php artisan storage:link 2>/dev/null || true
    php artisan config:cache
    php artisan route:cache
fi

exec "$@"
