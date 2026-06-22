# Panduan Konfigurasi Wildcard DNS & TLS (SSL) AbsenNow

Dokumen ini berisi panduan untuk mengonfigurasi domain wildcard (`*.absennow.id`) agar dapat berjalan secara dinamis ke aplikasi multi-tenant AbsenNow (Backend Laravel + Frontend Angular/Ionic).

---

## 1. Konfigurasi Wildcard DNS

Agar semua subdomain (misal: `tangerang.absennow.id`, `depok.absennow.id`) secara otomatis diarahkan ke server Anda, Anda perlu menambahkan record DNS Wildcard pada DNS Manager Anda (Cloudflare, DigitalOcean, cPanel, atau DNS provider lainnya).

| Type | Name | Value | TTL |
| :--- | :--- | :--- | :--- |
| **A** | `*` | IP Publik Server Anda (misal: `123.45.67.89`) | Auto / 3600 |
| **A** | `@` (root) | IP Publik Server Anda (misal: `123.45.67.89`) | Auto / 3600 |

> [!NOTE]
> Setelah ditambahkan, semua subdomain yang belum dibuat secara eksplisit akan secara otomatis diarahkan ke alamat IP server yang sama.

---

## 2. Mendapatkan Sertifikat TLS/SSL Wildcard Let's Encrypt

Sertifikat SSL Wildcard Let's Encrypt hanya bisa diterbitkan melalui tantangan verifikasi **DNS-01 (DNS TXT record)**. Anda tidak bisa menggunakan tantangan HTTP-01 biasa (`webroot` / `standalone`).

### Opsi A: Menggunakan Plugin DNS (Direkomendasikan & Otomatis)

Jika Anda menggunakan penyedia DNS seperti **Cloudflare**, Certbot dapat membuat dan menghapus record TXT secara otomatis untuk pembaruan (renewal) otomatis.

1. **Install Certbot dan Plugin DNS Cloudflare** (Ubuntu/Debian):
   ```bash
   sudo apt update
   sudo apt install certbot python3-certbot-nginx python3-certbot-dns-cloudflare -y
   ```

2. **Buat file kredensial API Cloudflare** di `/etc/letsencrypt/cloudflare.ini`:
   ```ini
   # /etc/letsencrypt/cloudflare.ini
   dns_cloudflare_api_token = TOKEN_API_CLOUDFLARE_ANDA
   ```
   *Amankan permission file ini:*
   ```bash
   sudo chmod 600 /etc/letsencrypt/cloudflare.ini
   ```

3. **Jalankan Certbot untuk membuat sertifikat**:
   ```bash
   sudo certbot certonly \
     --dns-cloudflare \
     --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
     -d absennow.id \
     -d *.absennow.id \
     --preferred-challenges dns-01 \
     --agree-tos \
     -m admin@absennow.id \
     --no-eff-email
   ```

### Opsi B: Menggunakan Mode Manual (Jika Tanpa Plugin DNS)

Jika provider DNS Anda tidak didukung oleh plugin otomatis:

1. **Jalankan perintah manual**:
   ```bash
   sudo certbot certonly \
     --manual \
     --preferred-challenges=dns \
     -d absennow.id \
     -d *.absennow.id \
     --agree-tos \
     -m admin@absennow.id
   ```

2. Certbot akan meminta Anda membuat record TXT di DNS Manager Anda:
   * **Name**: `_acme-challenge.absennow.id`
   * **Value**: Nilai acak yang diberikan oleh Certbot di terminal.
3. Tunggu 1-2 menit hingga DNS tersinkronisasi, lalu tekan `Enter` di terminal untuk verifikasi.

> [!WARNING]
> Mode manual tidak dapat diperbarui secara otomatis menggunakan `cron` atau `systemd` timer karena memerlukan interaksi manual. Sangat direkomendasikan menggunakan Opsi A (Plugin DNS) untuk produksi.

---

## 3. Konfigurasi Nginx Server Block

Setelah SSL didapatkan, perbarui konfigurasi server block Nginx untuk menangani wildcard domain dan meneruskan request dengan benar.

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name absennow.id *.absennow.id;

    # Redirect HTTP → HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name absennow.id *.absennow.id;

    # SSL Let's Encrypt Wildcard
    ssl_certificate     /etc/letsencrypt/live/absennow.id/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/absennow.id/privkey.pem;

    # SSL Security Optimization
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384';
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # ─── Laravel Backend (path /api dan /storage) ────────────────────────────
    root /var/www/absennow/backend/public;

    # Routing API Laravel
    location /api {
        try_files $uri $uri/ /index.php?$query_string;
    }

    # Storage link Laravel
    location /storage {
        alias /var/www/absennow/backend/storage/app/public;
        access_log off;
        expires max;
    }

    # Eksekusi PHP-FPM
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    # ─── Angular Frontend (Single Page Application) ─────────────────────────
    location / {
        root /var/www/absennow/frontend;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public";
    }

    # Cache static assets frontend
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        root /var/www/absennow/frontend;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # APK direct download path
    location /download/ {
        root /var/www/absennow/frontend;
        add_header Content-Disposition "attachment";
        add_header Content-Type "application/vnd.android.package-archive";
        access_log off;
    }

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
}
```

---

## 4. Konfigurasi Backend Laravel (`.env`)

Agar session cookie dan otentikasi Sanctum dapat dibagi di antara subdomain (misal: login di `absennow.id` tapi API diakses dari `tangerang.absennow.id` atau sebaliknya), sesuaikan variabel lingkungan di file `.env` produksi Laravel:

```env
# URL utama aplikasi
APP_URL=https://absennow.id
FRONTEND_URL=https://absennow.id

# Memungkinkan share session cookie di seluruh subdomain (*.absennow.id)
# NOTE: Titik di depan domain sangat krusial!
SESSION_DOMAIN=.absennow.id

# Memungkinkan Sanctum menerima otentikasi stateful/cookies dari seluruh subdomain
SANCTUM_STATEFUL_DOMAINS=absennow.id,*.absennow.id
```

---

## 5. Penyelesaian Masalah (Troubleshooting)

### A. CORS Error di Browser
Jika browser menampilkan error `Access-Control-Allow-Origin`, pastikan regex CORS di `app/config/cors.php` sudah aktif. Kami telah menambahkan dukungan ini secara otomatis di file tersebut dengan format:
```php
'allowed_origins_patterns' => [
    '/^https?:\/\/([a-z0-9-]+\.)?absennow\.id(:\d+)?$/',
]
```

### B. Session / Login Terputus Saat Pindah Subdomain
Jika user terlempar keluar (tidak terautentikasi) saat diarahkan ke subdomain, pastikan `SESSION_DOMAIN` di file `.env` ditulis dengan titik di awal domain: `.absennow.id`. Tanpa titik ini, browser tidak akan membagikan session cookie ke subdomain lain.
Selain itu, hapus cache config setelah mengubah `.env`:
```bash
php artisan config:clear
```
