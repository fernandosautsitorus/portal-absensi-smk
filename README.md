# 🏫 Portal Absensi SMK

Portal Presensi Siswa berbasis web yang dirancang khusus untuk memenuhi kebutuhan pencatatan, pemantauan, pelaporan kehadiran siswa, serta early warning system di Sekolah Menengah Kejuruan (SMK).

---

## 🚀 Fitur Utama (Berdasarkan PRD)

1. **Fase 1: Absen Harian Kelas**
   - Daftar siswa per kelas lengkap dengan NISN dan foto avatar
   - Opsi status: **Hadir (H)**, **Sakit (S)**, **Izin (I)**, **Alpa (A)**, **Terlambat (T)** + Catatan
   - Tombol instan **"Tandai Semua Hadir"**
   - Validasi data & penguncian status harian

2. **Fase 2: Rekap Kehadiran & Notifikasi**
   - Rekap persentase kehadiran bulanan & tahunan per siswa dan per kelas
   - **Early Warning System**: Peringatan otomatis jika siswa Alpa 3 hari berturut-turut
   - Pusat notifikasi untuk Wali Kelas, BK, dan Orang Tua

3. **Fase 3: Portal Orang Tua & Dasbor Eksekutif**
   - **Dasbor Kepala Sekolah**: Ringkasan analitik harian, grafik tren kehadiran mingguan, serta perbandingan antar jurusan SMK (TKJ, AKL, TKR, RPL)
   - **Portal Orang Tua**: Status kehadiran anak hari ini, grafik rekap bulanan, dan kontak pesan sekolah
   - **Master Data**: Pengelolaan Siswa, Kelas, Jurusan, dan penugasan Wali Kelas

4. **Fase 4: Autentikasi & RBAC (Role-Based Access Control)**
   - Proteksi route berbasis peran: `ADMIN`, `GURU`, `KEPSEK`, `ORANGTUA`
   - Manajemen akun pengguna (tambah, edit, reset password, aktivasi/deaktivasi)

5. **Fase 5: Unduh Laporan & Cetak**
   - Filter rentang tanggal fleksibel
   - Ekspor berkas **Excel (.xlsx)** via SheetJS
   - Ekspor berkas **PDF** via jsPDF
   - Format **Cetak Langsung** (*Print-ready*) lengkap dengan kolom tanda tangan Wali Kelas dan Kepala Sekolah

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Database & ORM**: SQLite (Prisma ORM)
- **Authentication**: NextAuth.js (JWT Token + BCrypt)
- **Charts**: Recharts
- **Exporting**: XLSX (Excel) + jsPDF / jspdf-autotable (PDF)

---

## 🔑 Akun Demo (Bawaan Database)

Password default untuk semua akun: `password123`

| Peran (Role) | Username | Password |
| :--- | :--- | :--- |
| **Admin** | `admin` | `password123` |
| **Wali Kelas / Guru** | `guru1` s/d `guru8` | `password123` |
| **Kepala Sekolah** | `kepsek` | `password123` |
| **Orang Tua** | `ortu1` s/d `ortu5` | `password123` |

---

## 💻 Panduan Instalasi Lokal

```bash
# 1. Clone repository
git clone <URL_REPOSITORY_ANDA>
cd portal-absensi-smk

# 2. Install dependensi
npm install

# 3. Setup database
npx prisma db push
npx tsx prisma/seed.ts

# 4. Jalankan server development
npm run dev
```

Buka di browser: [http://localhost:3000](http://localhost:3000)
