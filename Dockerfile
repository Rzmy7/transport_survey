FROM node:20-alpine AS frontend-build

WORKDIR /src/Frontend

COPY Frontend/package*.json ./
RUN npm ci

COPY Frontend/ ./
ENV VITE_API_BASE_URL=/api
RUN npm run build

FROM php:8.4-apache AS app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        libpq-dev \
        libsqlite3-dev \
        libzip-dev \
        libonig-dev \
        unzip \
        iproute2 \
    && docker-php-ext-install pdo_pgsql pdo_sqlite zip mbstring \
    && rm -rf /var/lib/apt/lists/*

# Fix AH00534: Multiple MPMs loaded by enforcing prefork
RUN a2dismod mpm_event mpm_worker || true \
    && a2enmod mpm_prefork

# Configure Apache for Laravel
RUN a2enmod rewrite \
    && sed -i 's!/var/www/html!/app/Backend/public!g' /etc/apache2/sites-available/000-default.conf \
    && sed -i 's!/var/www/!/app/Backend/public!g' /etc/apache2/apache2.conf \
    && sed -i 's!AllowOverride None!AllowOverride All!g' /etc/apache2/apache2.conf

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app/Backend

COPY Backend/ ./
RUN composer install --no-interaction --no-dev --optimize-autoloader

COPY --from=frontend-build /src/Frontend/dist ./public

# Ensure storage and database directories are writable by Apache
RUN chown -R www-data:www-data storage bootstrap/cache database

EXPOSE 8000

CMD set -ex; \
    echo "=== 1. Starting container ==="; \
    echo "Port is ${PORT:-8000}"; \
    echo "=== 2. Configuring Apache Ports ==="; \
    sed -i "s/:80/:${PORT:-8000}/g" /etc/apache2/sites-available/000-default.conf; \
    sed -i "s/Listen 80/Listen ${PORT:-8000}/g" /etc/apache2/ports.conf; \
    echo "=== 3. Testing Apache Configuration ==="; \
    echo "--- Applying minimal runtime fix for MPM conflict ---"; \
    echo "--- DIAGNOSTICS: readlink mpm_event.load ---"; \
    readlink -f /etc/apache2/mods-enabled/mpm_event.load || true; \
    echo "--- DIAGNOSTICS: readlink mpm_prefork.load ---"; \
    readlink -f /etc/apache2/mods-enabled/mpm_prefork.load || true; \
    rm -f /etc/apache2/mods-enabled/mpm_event.* /etc/apache2/mods-enabled/mpm_worker.*; \
    echo "--- DIAGNOSTICS: mods-enabled mpm ---"; \
    ls -la /etc/apache2/mods-enabled | grep mpm || true; \
    echo "--- END DIAGNOSTICS ---"; \
    apachectl -t; \
    echo "=== 4. Checking Environment Status ==="; \
    php artisan about || true; \
    echo "=== 5. Waiting for Database / Setting up SQLite ==="; \
    if [ "${DB_CONNECTION:-sqlite}" = "sqlite" ]; then \
        DB_PATH="${DB_DATABASE:-/app/Backend/database/database.sqlite}"; \
        mkdir -p "$(dirname "$DB_PATH")"; \
        touch "$DB_PATH"; \
        chown -R www-data:www-data /app/Backend/database; \
    fi; \
    attempt=1; \
    until php artisan migrate --force --seed; do \
        if [ "$attempt" -ge 10 ]; then \
            echo "=== FATAL: Database did not become available after 10 attempts ===" >&2; \
            exit 1; \
        fi; \
        attempt=$((attempt + 1)); \
        echo "=== Database not ready yet, retrying (${attempt}/10)... ===" >&2; \
        sleep 5; \
    done; \
    echo "=== Database migrated and seeded successfully ==="; \
    echo "=== 6. Building Caches ==="; \
    php artisan config:cache; \
    php artisan route:cache; \
    php artisan view:cache; \
    echo "=== 7. Starting Apache ==="; \
    apache2-foreground & \
    APACHE_PID=$!; \
    sleep 3; \
    echo "=== 8. Port Binding Status ==="; \
    ss -tulpn; \
    wait $APACHE_PID