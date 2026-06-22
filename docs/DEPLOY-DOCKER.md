# Deploy AbsenNow di VPS via Docker

Domain: **https://hadirnow.jaritechnology.com** · Container expose port **8682** (HTTP) ·
reverse proxy host yang pegang domain + HTTPS.

## Arsitektur

```
Internet ──HTTPS──> Reverse proxy host (nginx/Caddy, port 443)
                      └─ proxy_pass → 127.0.0.1:8682
                                         │
                          ┌──────────────┴───────────── docker compose ──────────┐
                          │  web (nginx)  :80→8682                                 │
                          │    ├─ / .............. Angular SPA (static)            │
                          │    ├─ /api, /sanctum . fastcgi → app:9000 (Laravel)    │
                          │    └─ /storage ....... uploaded files (shared volume)  │
                          │  app (php-fpm, Laravel)                                │
                          │  queue (php artisan queue:work)                        │
                          │  db (postgres:16, volume db_data)                      │
                          └────────────────────────────────────────────────────────┘
```

File terkait: `docker-compose.yml`, `docker/backend.Dockerfile`, `docker/frontend.Dockerfile`,
`docker/nginx.conf`, `docker/entrypoint.sh`, `docker/php.ini`.

## Prasyarat di VPS
- Docker Engine + Docker Compose plugin (`docker compose version`).
- DNS `hadirnow.jaritechnology.com` → IP VPS.

## Langkah deploy

```bash
# 1. Clone
git clone https://github.com/frizzlabs/AbsenNow---Absen-Mudah-Kinerja-Terarah.git
cd AbsenNow---Absen-Mudah-Kinerja-Terarah

# 2. Env compose (DB + port)
cp docker/compose.env.example .env
nano .env            # set DB_PASSWORD yang kuat (APP_PORT=8682 sudah default)

# 3. Env Laravel (produksi)
cp deploy/env.production.example absen-backend/.env
nano absen-backend/.env
#   WAJIB diisi/diubah:
#     APP_ENV=production, APP_DEBUG=false
#     APP_URL=https://hadirnow.jaritechnology.com
#     FRONTEND_URL=https://hadirnow.jaritechnology.com
#     SANCTUM_STATEFUL_DOMAINS=hadirnow.jaritechnology.com
#     DB_HOST=db                 (nama service compose, BUKAN 127.0.0.1)
#     DB_DATABASE / DB_USERNAME / DB_PASSWORD  → SAMA dengan .env di langkah 2
#     RESEND_API_KEY=...         (key Resend produksi)

# 4. Generate APP_KEY, lalu tempel ke absen-backend/.env
docker compose run --rm app php artisan key:generate --show
#   copy hasilnya (base64:....) ke APP_KEY= di absen-backend/.env

# 5. Build & jalankan
docker compose up -d --build
#   entrypoint app otomatis: tunggu DB → migrate --force → cache config/route

# 6. Seed awal (pertama kali saja — bikin platform super-admin + Pemda Demo)
docker compose exec app php artisan db:seed --force
#   (atau untuk reset total: docker compose exec app php artisan migrate:fresh --seed --force)

# cek
docker compose ps
curl -I http://127.0.0.1:8682
```

## Reverse proxy host (HTTPS → 8682)

### Opsi A — nginx + certbot
```nginx
server {
    server_name hadirnow.jaritechnology.com;
    client_max_body_size 20M;
    location / {
        proxy_pass http://127.0.0.1:8682;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto https;
    }
    listen 80;
}
# lalu: sudo certbot --nginx -d hadirnow.jaritechnology.com
```

### Opsi B — Caddy (auto-HTTPS, paling singkat)
```
hadirnow.jaritechnology.com {
    reverse_proxy 127.0.0.1:8682
}
```

## Update versi baru
```bash
git pull
docker compose up -d --build      # rebuild image, migrasi jalan otomatis
```

## Operasional
```bash
docker compose logs -f app        # log Laravel/php-fpm
docker compose logs -f web        # log nginx
docker compose exec app php artisan tinker
docker compose exec db pg_dump -U absennow_user absen_now_prod > backup.sql   # backup DB
```

## Catatan
- **`absen-backend/.env` & root `.env` JANGAN di-commit** (sudah di-gitignore). Isi langsung di VPS.
- File upload (foto absen) ada di volume `app_storage`; DB di volume `db_data`. Backup keduanya.
- Opsional hardening (kalau pakai cookie Sanctum / butuh URL https akurat di belakang proxy):
  set trusted proxies di `absen-backend/bootstrap/app.php`
  → `->withMiddleware(fn ($m) => $m->trustProxies(at: '*'))`. Untuk auth token (Bearer) saat ini tidak wajib.
- Mobile (APK/iOS) tetap pakai `environment.prod.ts` → `https://hadirnow.jaritechnology.com/api` (absolut).
