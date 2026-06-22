# ── Frontend: Angular/Ionic build → served by Nginx (also proxies /api) ──────
# Stage 1: build the SPA
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
# Angular dep tree has a peer mismatch (service-worker v21 vs build-angular v20);
# mirror the working local install which tolerates it.
RUN npm ci --legacy-peer-deps
COPY . .
RUN npm run build -- --configuration=production
# Angular outputs to /app/www (see angular.json outputPath)

# Stage 2: nginx serving the SPA + reverse-proxy to php-fpm
FROM nginx:1.27-alpine
COPY --from=build /app/www /var/www/frontend
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
