FROM node:20-alpine AS frontend-build

WORKDIR /src/Frontend

COPY Frontend/package*.json ./
RUN npm ci

COPY Frontend/ ./
ENV VITE_API_BASE_URL=/api
RUN npm run build

FROM php:8.4-cli-bookworm AS app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        git \
        libpq-dev \
        libsqlite3-dev \
        libzip-dev \
        libonig-dev \
        unzip \
    && docker-php-ext-install pdo_pgsql pdo_sqlite zip mbstring \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app/Backend

COPY Backend/ ./
RUN composer install --no-interaction --no-dev --optimize-autoloader

COPY --from=frontend-build /src/Frontend/dist ./public

EXPOSE 8000

CMD ["sh", "-c", "php artisan migrate --force --seed && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"]