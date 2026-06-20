# Desktop Web Layout — Design Spec (Fase 0 + Fase 1)

**Tanggal:** 2026-06-20
**Status:** Disetujui (menunggu review spec)
**Scope dokumen ini:** Fase 0 (fondasi shell desktop) + Fase 1 (Home & absen desktop)

---

## 1. Konteks

AbsenNow adalah satu produk yang berjalan di **tiga platform**: iOS (native), Android (native), dan **web desktop** (browser komputer). Codebase-nya satu: aplikasi Ionic + Angular (standalone components). Build web saat ini hanyalah layout mobile yang diregangkan ke lebar desktop sehingga terlihat janggal (tombol selebar layar, banyak ruang kosong, bottom-nav membentang penuh).

Tujuan: membuat **tampilan desktop yang sesungguhnya** (memanfaatkan lebar layar) tanpa mengganggu versi mobile native.

### Temuan struktur kode yang relevan
- Tidak ada layout "shell"/induk. Setiap halaman menyertakan `<app-bottom-nav>` sendiri (34 file). Routing flat di `src/app/app.routes.ts`.
- Karena `bottom-nav` sudah hadir di semua halaman utama, navigasi desktop bisa dibuat dengan **mengevolusi komponen `bottom-nav` menjadi responsif** — tanpa membongkar routing.
- Gating role sudah ada via `RoleService.can(...)` dan cache permission (`my_permissions`).
- Absen mobile memakai selfie (kamera native) + GPS. Komponen terkait: `camera-frame`, `face-validation`, `validation`, dan service `attendance.service.ts` (check-in/out).

---

## 2. Tujuan & Non-Tujuan

### Tujuan
- Web desktop punya layout khas desktop: **sidebar kiri** + area konten lebar dengan kolom max-width dan grid multi-kolom.
- **Parity penuh, semua role**, termasuk staff bisa **absen masuk/keluar dari komputer** (skenario lupa bawa HP).
- Verifikasi absen desktop: **selfie (webcam) + GPS browser**, dengan toleransi radius dilonggarkan.
- **Mobile native (iOS/Android) tidak berubah** — semua perubahan desktop dibatasi breakpoint `≥ 1024px`.

### Non-Tujuan (untuk dokumen ini)
- Bukan codebase/route terpisah untuk desktop (pakai pendekatan responsif satu app).
- Belum menggarap modul di luar Home/absen (cuti, expense, payslip, lembur, izin, timesheet, aktivitas, dinas luar, kinerja, admin) — itu fase berikutnya.
- Tidak mengubah API/endpoint maupun logika bisnis absen.

---

## 3. Pendekatan

**Approach A (responsif satu app) + sentuhan C (hybrid)**, dikerjakan **bertahap**.

- Satu codebase, satu route tree, semua service & logika dipakai ulang.
- Breakpoint desktop: **`≥ 1024px`**. Di bawah itu = perilaku mobile sekarang (tak tersentuh).
- Layar yang strukturnya beda jauh dari mobile (mis. dashboard) direflow khusus; sisanya menyesuaikan via CSS breakpoint.

Pemecahan fase:
- **Fase 0** — fondasi shell (dokumen ini).
- **Fase 1** — Home & absen desktop (dokumen ini).
- Fase berikutnya (spec terpisah): self-service (cuti/expense/payslip/dll) lalu manajemen (dashboard tim, review koreksi & dinas luar, admin).

---

## 4. Fase 0 — Fondasi Shell Desktop

### 4.1 Navigasi responsif (`bottom-nav` → sidebar)
Komponen: `src/app/shared/components/bottom-nav/bottom-nav.component.{html,scss,ts}`

- **< 1024px:** tetap bar bawah `position: fixed; bottom: 0` seperti sekarang. Tidak ada perubahan perilaku.
- **≥ 1024px:** menjadi **sidebar kiri tetap** `position: fixed; left: 0; top: 0; bottom: 0; width: 240px`:
  - Logo/brand di atas.
  - Item nav **vertikal dengan label** (ikon + teks): Beranda, Aktivitas, Keuangan, Notifikasi (item yang sudah ada), plus item sesuai role (mis. Admin/Review) bila `RoleService.can(...)` mengizinkan.
  - Avatar/entri **Profil di kaki sidebar** — menggantikan FAB "K" yang di mobile berada di tengah-bawah.
  - State aktif mengikuti route saat ini (sudah ada logikanya).
- Implementasi via CSS `@media (min-width: 1024px)` di SCSS komponen; struktur HTML ditambah label & wrapper yang disembunyikan/ditampilkan per breakpoint (bukan dua komponen terpisah).

### 4.2 Wrapper konten desktop
- Sebuah **utility class** global `.desktop-shell-content` yang ditambahkan ke elemen konten halaman (mis. di `ion-content` halaman utama). Keputusan: pakai utility class, **bukan** mengubah `ion-content` secara global, supaya adopsi bisa per-halaman dan aman.
  - `≥ 1024px`: dorong konten `margin-left: 240px` (ruang sidebar) dan beri **kolom konten max-width 1200px** yang ditengahkan dengan padding horizontal.
  - `< 1024px`: tidak berlaku.
- Didefinisikan di `src/global.scss`. Halaman yang belum diberi kelas ini tetap berfungsi; di desktop ia hanya perlu menghindari tertutup sidebar (ditangani saat halaman diadaptasi).

### 4.3 Breakpoint global
- Definisikan satu sumber breakpoint desktop (variabel/mixin SCSS, mis. `$bp-desktop: 1024px`) yang dipakai konsisten oleh komponen nav, wrapper, dan halaman.
- Lokasi: file SCSS shared yang sudah ada (atau tambah partial kecil yang di-`@use`/`@import` di `global.scss`).

### 4.4 Yang TIDAK berubah di Fase 0
- Routing, service, dan markup halaman selain penambahan kelas wrapper.
- Tampilan & perilaku mobile (< 1024px).

---

## 5. Fase 1 — Home & Absen Desktop

### 5.1 Dashboard Home (reflow desktop)
Halaman: `src/app/home/home.page.{html,scss}` (dan varian `default-variant`, `checked-in`, `checked-out` mengikuti pola yang sama).

Di `≥ 1024px`, dari satu kolom panjang menjadi:
- **Hero** (gradient biru) full-width kolom konten: tanggal, sapaan + nama, lokasi saat ini, badge role, avatar.
- **Baris utama 2 kolom:**
  - Kiri: kartu **Waktu Saat Ini + Jadwal Kerja + tombol Geser untuk Absen** (`app-swipe-button` yang sudah dioptimasi).
  - Kanan: kartu **status hari ini** (badge Tepat Waktu/Terlambat, jam Masuk & Keluar).
- **Aksi Cepat**: grid **4 kolom** (mobile 2 kolom).
- **Recent Updates**: di bawah, boleh 2 kolom.

Di `< 1024px`: tata letak mobile sekarang dipertahankan.

### 5.2 Flow absen desktop (selfie webcam + GPS browser)
- Pemicu: tombol/slider "Absen Masuk/Keluar" di Home (sama seperti mobile).
- **Kamera:** gunakan **`navigator.mediaDevices.getUserMedia({ video: true })`** untuk menampilkan webcam dan mengambil snapshot selfie (canvas → blob/dataURL). Mengganti jalur kamera native pada desktop.
- **Lokasi:** gunakan **`navigator.geolocation.getCurrentPosition`** (sudah dipakai di mobile). Untuk jalur desktop, **toleransi radius kantor dilonggarkan** (nilai longgar dikonfigurasi; mengakui akurasi desktop berbasis IP/WiFi rendah).
- **Komponen:** adaptasi `camera-frame` / `face-validation` / `validation` agar mendukung sumber webcam pada desktop; deteksi platform/breakpoint menentukan jalur kamera.
- **Submit:** memakai **endpoint & service check-in/out yang sama** (`attendance.service.ts`). Tidak ada perubahan API.
- **Fallback/izin:** bila webcam atau lokasi ditolak/diblokir browser, tampilkan pesan jelas dan blokir submit (konsisten dengan aturan validasi mobile).

### 5.3 Pertimbangan
- Webcam & geolocation butuh **konteks aman (HTTPS)** di produksi; `localhost` saat dev sudah dianggap aman oleh browser.
- Pelonggaran radius desktop adalah **keputusan kebijakan** — nilai pastinya dikonfirmasi saat implementasi (default: kelipatan dari radius mobile, dapat diatur).

---

## 6. Data Flow

Tidak ada perubahan pada service maupun endpoint. Absen desktop menempuh jalur yang sama:

```
UI (Home desktop) → ambil selfie (webcam) + lokasi (geolocation)
  → attendance.service check-in/out (endpoint sama)
  → backend memvalidasi (radius dilonggarkan untuk sumber desktop)
  → update status → UI refresh
```

Gating menu/aksi tetap memakai `RoleService.can(...)`.

---

## 7. Testing & Verifikasi

- **Manual, lintas breakpoint:** verifikasi di lebar `< 1024px` (mobile tak berubah) dan `≥ 1024px` (sidebar + konten lebar).
- **Mobile native tidak regresi:** cek build/emulator iOS/Android bahwa bottom-nav & Home tetap seperti semula.
- **Absen desktop:** uji izin webcam & lokasi (allow/deny), pengambilan selfie, submit check-in & check-out, serta penolakan saat izin diblokir.
- **Role gating:** item sidebar tampil sesuai permission (staff vs atasan vs admin).

---

## 8. Risiko & Catatan

- **Containing block untuk elemen fixed:** sidebar dan elemen `position: fixed` lain harus tetap rapi di area desktop; perhatikan interaksi dengan modal/overlay Ionic.
- **Akurasi GPS desktop rendah** → mitigasi via pelonggaran radius (kebijakan, dikonfirmasi saat implementasi).
- **HTTPS di produksi** wajib untuk webcam/geolocation.
- Halaman yang belum diadaptasi tetap berfungsi (hanya bergeser memberi ruang sidebar) — adaptasi penuh dilakukan bertahap di fase berikutnya.

---

## 9. Out of Scope / Fase Berikutnya (spec terpisah)
- Self-service desktop: cuti, expense, payslip, lembur, izin, timesheet, aktivitas.
- Manajemen desktop: dashboard tim, review koreksi & dinas luar, admin/role management — kandidat layout desktop khusus (hybrid).
