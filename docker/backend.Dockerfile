# ── Backend: Laravel (PHP-FPM) ───────────────────────────────────────────────
# Stage 1: install PHP dependencies
FROM composer:2 AS vendor
WORKDIR /app
COPY absen-backend/ ./
RUN composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist

# Stage 2: runtime
FROM php:8.3-fpm-alpine

# Runtime libs + build deps for PHP extensions
RUN apk add --no-cache postgresql-libs libzip icu-libs oniguruma \
 && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS postgresql-dev libzip-dev icu-dev oniguruma-dev \
 && docker-php-ext-install pdo_pgsql pgsql bcmath zip pcntl opcache intl \
 && apk del .build-deps

WORKDIR /var/www/html
COPY --from=vendor /app ./

COPY docker/php.ini /usr/local/etc/php/conf.d/zz-app.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint
RUN chmod +x /usr/local/bin/entrypoint \
 && chown -R www-data:www-data storage bootstrap/cache

EXPOSE 9000
ENTRYPOINT ["entrypoint"]
CMD ["php-fpm"]
