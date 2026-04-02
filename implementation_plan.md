# Optimasi Kode, Hapus File Tidak Terpakai, dan Validasi Next.js 15 & Tailwind 4.2

Berdasarkan analisis repositori `d:\Js\educore`, telah ditemukan beberapa hal yang dapat diperbaiki agar sesuai dengan permintaan Anda (efisiensi, file tidak dipakai, Next.js 15, dan Tailwind 4.2).

## Proposed Changes

### Komponen (File Tidak Terpakai)
Setelah dilakukan pengecekan dependensi ke seluruh file, ada dua file komponen yang tidak diimpor / digunakan di bagian mana pun:
#### [DELETE] `d:\Js\educore\components\ChangePasswordModal.tsx`
#### [DELETE] `d:\Js\educore\components\JadwalUploader.tsx`

---

### App (Perbaikan Next.js 15 & Tailwind 4.2)
#### [MODIFY] `d:\Js\educore\next.config.ts`
- **Tujuan**: Mengizinkan domain gambar eksternal `ui-avatars.com` melalui `remotePatterns` (Aturan Next.js 15 untuk optimasi gambar).

#### [MODIFY] `d:\Js\educore\app\admin\layout.tsx`
- **Tujuan (Efektivitas & Next.js 15)**: Mengganti tag HTML standar `<img>` menjadi komponen `<Image>` bawaan Next.js 15 (`next/image`) untuk performa gambar yang lebih optimal.

#### [MODIFY] `d:\Js\educore\app\globals.css`
- **Tujuan (Tailwind 4.2)**: Mengonfirmasi bahwa setup CSS telah menggunakan `@theme` dan sintaks baru Tailwind v4 secara penuh. Tidak ada perubahan besar yang dibutuhkan, namun validasi Tailwind 4 telah selesai dilakukan (konfigurasi sudah di dalam CSS dan `@tailwindcss/postcss` sudah di PostCSS plugin, ini adalah standar terbaik untuk v4 tanpa vite).

#### Validasi Next.js 15 (Route Params)
- **Tujuan**: Aturan utama Next.js 15 terkait asinkronitas `searchParams` (`const params = await searchParams;`) **telah diterapkan** dengan benar pada *route* halaman seperti `admin/siswa/page.tsx` dan `admin/guru/page.tsx`. Semua *type* `Promise` telah dikonfigurasi dengan baik.

## Open Questions

> [!IMPORTANT]
> - Apakah Anda memiliki fungsionalitas Auth tertentu yang sebelumnya menggunakan `ChangePasswordModal.tsx` atau `JadwalUploader.tsx` dan akan diimplementasikan ulang nanti? (Jika tidak, file tersebut akan langsung dihapus untuk efisiensi ruang).
> - Di `app/admin/layout.tsx`, *fetching* nama pemakai dilakukan via *Client Component* (`useEffect`). Ini dapat menyebabkan gambar dan jabatan telat muncul sekejap. Apakah Anda ingin ini diperbaiki melalui *Server Component*, atau biarkan saja sebagai *Client Component* (karena lebih mudah dibaca untuk integrasi *auth* sementara)?

## Verification Plan

### Automated / Manual Verification
- Menjalankan `npm run build` atau `npx next build` untuk memastikan penghapusan file tidak memiliki dependensi yang tertinggal dan tidak ada masalah routing.
- Meninjau *User Interface* memastikan `<Image>` dari `ui-avatars.com` memuat dengan baik.
