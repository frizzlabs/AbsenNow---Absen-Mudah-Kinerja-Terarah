# Multi-Tenant (Multi-Pemda) — Design Spec

**Tanggal:** 2026-06-20
**Status:** Disetujui (menunggu review spec)
**Scope dokumen:** Fondasi multi-tenancy untuk melayani banyak instansi (Pemda Tangerang, Bogor, Bekasi, dst.) dalam satu aplikasi.

---

## 1. Konteks & Keputusan

AbsenNow akan dijual ke banyak Pemerintah Daerah (Pemda). Saat ini aplikasi **single-tenant**: tidak ada konsep organisasi sama sekali — `User` hanya punya `department` (string), `role_id`, `employee_id`; `Office` hanya lokasi fisik; semua data ke-scope hanya by `user_id`; role bersifat global.

Keputusan yang sudah disepakati:
- **Deployment: Shared SaaS** — satu aplikasi + satu database melayani semua Pemda.
- **Model tenancy: row-level** — kolom `organization_id` di tabel-tabel, di-filter via global scope.
- **Tenant resolution:** Web pakai **subdomain** per Pemda (branding); Mobile dari **akun** user. Otoritas tetap `user.organization_id`.
- **Role: per-Pemda** + tier **platform super-admin** (vendor) di atasnya.
- **Data existing: mulai bersih** (reset data dummy; Pemda asli dibuat lewat onboarding).

### Non-Tujuan
- Bukan database-per-tenant / schema-per-tenant (row-level dipilih).
- Tidak menggarap billing/langganan antar Pemda (di luar scope).
- Tidak migrasi/backfill data lama (sengaja reset).

---

## 2. Hierarki

```
Organization (Pemda)
   └─ OPD / Dinas  (field `department` pada user)
        └─ Office  (kantor fisik + GPS)
             └─ User (pegawai)
```

---

## 3. Model Data

### 3.1 Tabel baru: `organizations`
| kolom | tipe | catatan |
|---|---|---|
| id | bigint PK | |
| name | string | nama Pemda (mis. "Pemda Tangerang") |
| code | string unik | slug subdomain (mis. `tangerang`) |
| logo_url | string nullable | branding |
| settings | json nullable | default jam kerja, kebijakan cuti, dll |
| is_active | boolean | default true |
| timestamps | | |

### 3.2 Tambah `organization_id` (FK, indexed) ke:
`users`, `offices`, `roles`, `attendances`, `leaves`, `leave_balances`, `expenses`, `permissions`, `overtimes`, `timesheets`, `timesheet_events`, `activities`, `payslips`, `payslip_items`, `kpis`, `kpi_histories`, `feedbacks`, `performance_reviews`, `attendance_corrections`, `dinas_luar`, `user_identities`.

Walau sebagian besar tabel sudah ter-scope `user_id`, `organization_id` tetap di-stamp untuk efisiensi query + jaring pengaman.

### 3.3 Keunikan jadi per-org
- `employee_id` unik per (`organization_id`, `employee_id`).
- Nama `office` & nama `role` unik per `organization_id`.
- **Email:** unik per-org (user yang sama bisa ada di >1 Pemda sebagai akun berbeda). Platform super-admin adalah akun khusus dengan `organization_id = null`.

---

## 4. Tenant Context & Penegakan (server-side)

- **Sumber otoritas:** `user.organization_id` (dari token Sanctum → user).
- **Middleware `ResolveTenant`:**
  - Web: baca subdomain dari `Host` → cari `organizations.code` → set tenant aktif. **Wajib cocok** dengan `user.organization_id`; kalau tidak → 403.
  - Mobile: tenant aktif = `user.organization_id`.
  - Simpan tenant aktif di service request-scoped (mis. `TenantContext`).
- **Global scope `BelongsToOrganization` (trait):**
  - Otomatis menambahkan `where organization_id = <tenant aktif>` pada semua query model tenant.
  - Otomatis mengisi `organization_id` saat `creating`.
  - **Bypass** untuk `platform_superadmin` (boleh lintas-org), dengan opsi filter org tertentu.
- Token Sanctum **tidak berubah** strukturnya.

---

## 5. Role & Tier Admin

- `roles` mendapat `organization_id` (nullable → null = role level platform).
- **Tier baru `platform_superadmin`** (org null): kelola daftar Pemda, onboard, visibilitas lintas-org.
- Saat sebuah Organization dibuat, sistem **men-seed set role default** Pemda itu dari template: `staff`, `supervisor`/`atasan`, `manager`, `org_admin` (+ permission-nya).
- `org_admin` mengelola user, kantor, role, dan kebijakan **hanya di org-nya**.
- `RoleService` / gating UI yang sudah ada tetap dipakai, hanya jadi ter-scope per org.

---

## 6. Flow Onboarding Pemda (oleh platform super-admin)

1. Super-admin membuat Organization: nama, `code` (subdomain), logo, jam kerja & kebijakan cuti default.
2. Sistem seed role + permission default untuk org tsb.
3. Super-admin membuat akun **org-admin** pertama (email + password sementara / undangan).
4. Org-admin login (web: `code.absennow.id`) → setup kantor (GPS), import pegawai (CSV bulk), atur OPD/department & role.
5. Pegawai login → ter-scope ke Pemda-nya.

---

## 7. Flow Login & Resolution

- **Web:** kunjungi `tangerang.absennow.id` → frontend baca subdomain → panggil endpoint branding publik (`GET /tenant/{code}` → nama+logo) → tampilkan branding di layar login → login memvalidasi user milik org tsb.
- **Mobile:** login email+password (+OTP) biasa → backend balikkan user beserta `organization_id` → app ter-scope.
- Semua request membawa token Sanctum; backend menurunkan org dari user (+ validasi subdomain untuk web).

---

## 8. Frontend

- **`TenantService` (web):** deteksi subdomain, fetch branding (nama/logo/warna) untuk layar login + header/sidebar.
- **Branding:** logo & nama Pemda muncul di login dan sidebar/header desktop.
- Sebagian besar halaman jalan apa adanya karena data auto-scope di server.
- **Modul admin bertambah:**
  - **Organizations** (khusus platform super-admin): CRUD Pemda + buat org-admin pertama.
  - **Onboarding org-admin:** kelola kantor, import/buat pegawai (CSV), assign OPD & role.

---

## 9. Migrasi (mulai bersih)

- Migration baru: buat `organizations`; tambah `organization_id` ke semua tabel di §3.2 (indexed, FK).
- **Reset data dummy.** Seeder baru:
  - 1 akun **platform super-admin** (`organization_id = null`).
  - (Opsional) 1 Pemda demo + org-admin demo untuk pengujian.
- `RolePermissionSeeder` diperbarui: seed permission master + template role default yang dipakai saat org baru dibuat, plus role level platform.

---

## 10. Checklist Scope & Keamanan

- Penyimpanan file ter-namespace per org: `storage/{organization_id}/corrections/...`, avatar, evidence, dll.
- Approval (atasan) hanya untuk data dalam org yang sama (guard org selain `user_id`).
- Semua dashboard/laporan ter-scope org: `team-dashboard`, `admin/corrections`, `dinas-luar/review`, `team-list`.
- Rate limit, OTP, reset password tidak terpengaruh (tetap per-user/email).
- Uji bahwa **tidak ada kebocoran lintas-org** (user Pemda A tak bisa lihat/aksi data Pemda B).

---

## 11. Phasing Implementasi

- **Fase 1 — Fondasi tenancy (backend):** tabel `organizations`, `organization_id` di semua tabel, global scope + trait, middleware resolve tenant, tier `platform_superadmin`, seeder baru, reset data. Endpoint branding publik `GET /tenant/{code}`.
- **Fase 2 — Onboarding:** CRUD Organizations (super-admin), manajemen user/kantor + import CSV (org-admin), seeding role per-org saat create.
- **Fase 3 — Web subdomain & branding:** `TenantService`, deteksi subdomain, branding login + header. (Mobile sudah jalan dari akun sejak Fase 1.)

Dokumen ini mencakup keseluruhan desain; implementasi dimulai dari **Fase 1**.

---

## 12. Risiko & Catatan

- **Kebocoran data antar-tenant** adalah risiko utama → mitigasi via global scope wajib + uji negatif lintas-org.
- **Subdomain di produksi** butuh wildcard DNS (`*.absennow.id`) + TLS wildcard.
- **Dev lokal subdomain:** gunakan `*.localhost` atau host-mapping; mobile tidak terpengaruh.
- Menambah `organization_id` ke banyak tabel = perubahan fondasi besar; karena data direset, migrasi relatif lurus (tanpa backfill).
- Pertimbangkan index gabungan (mis. `(organization_id, user_id)`, `(organization_id, date)`) untuk performa query yang sering.
