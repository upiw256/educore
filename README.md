============================================================
           EDUCORE - SCHOOL MANAGEMENT SYSTEM
============================================================

EduCore adalah platform manajemen sekolah modern yang dirancang 
untuk integrasi data cepat antara sistem lokal dan Web Service 
Dapodik SMAN 1 Margaasih.

------------------------------------------------------------
1. FITUR UTAMA
------------------------------------------------------------
* Real-time Dashboard: Menampilkan statistik total siswa, 
  guru (PTK), dan aktivitas sekolah.
* Smart Sync System: Fitur sinkronisasi satu klik untuk 
  menarik data Siswa dan PTK dari API Pusat dengan visualisasi 
  progress bar.
* Bulk Operations: Menggunakan metode bulkWrite MongoDB untuk 
  memproses ribuan data dalam hitungan detik tanpa duplikasi.
* Modern UI/UX: Tampilan Dark Mode elegan dengan aksen 
  Electric Blue menggunakan Tailwind CSS.

------------------------------------------------------------
2. STACK TEKNOLOGI
------------------------------------------------------------
* Framework: Next.js 15 (App Router)
* Database: MongoDB dengan Mongoose
* Styling: Tailwind CSS
* Icons: Lucide React
* Language: TypeScript

------------------------------------------------------------
3. INSTALASI & PERSIAPAN
------------------------------------------------------------
A. Clone Proyek:
   git clone https://github.com/username/educore.git
   cd educore

B. Instalasi Dependensi:
   npm install

C. Konfigurasi Environment (.env.local):
   MONGODB_URI=mongodb://127.0.0.1:27017/educore
   DAPODIK_BARRIER=margaasih
   API_SISWA=https://api.sman1margaasih.sch.id/api/siswa
   API_GURU=http://app.sman1margaasih.sch.id:30000/api/guru

D. Jalankan Aplikasi:
   npm run dev

------------------------------------------------------------
4. STRUKTUR FOLDER PENTING
------------------------------------------------------------
* /app/admin/dashboard - Halaman utama statistik.
* /app/api/sync        - Endpoint backend sinkronisasi.
* /components          - Komponen UI (Sidebar, SyncButton).
* /models              - Skema Mongoose (Student.ts, Teacher.ts).
* /lib                 - Konfigurasi koneksi database.

------------------------------------------------------------
5. CATATAN PENGEMBANGAN
------------------------------------------------------------
* Sync Logic: Menggunakan ptk_id dan peserta_didik_id sebagai 
  kunci unik untuk mencegah data ganda (Upsert).
* Performance: Pastikan MongoDB Index sudah aktif pada field 
  ID unik untuk kecepatan proses bulk.

============================================================
Developed with for SMAN 1 Margaasih.
============================================================