import mongoose, { Schema, model, models } from "mongoose";

// Struktur data untuk tabel Izin
const IzinSiswaSchema = new Schema(
  {
    nis: { 
      type: String, 
      required: true,
      index: true // Ditambah index agar pencarian NIS lebih cepat
    },
    name: { 
      type: String, 
      required: true 
    },
    className: { 
      type: String, 
      required: true 
    },
    type: { 
      type: String, 
      enum: ["MASUK", "KELUAR"], // Membatasi hanya boleh dua pilihan ini
      required: true 
    },
    reason: { 
      type: String, 
      required: true 
    },
    time: { 
      type: Date, 
      default: Date.now // Otomatis mencatat waktu saat izin dibuat
    },
    recorded_by: { 
      type: String, 
      default: "Admin Piket" // Bisa diisi nama user yang login nanti
    }
  },
  { 
    timestamps: true // Otomatis membuat kolom 'createdAt' dan 'updatedAt'
  }
);

// Mencegah error "OverwriteModelError" saat hot-reload di Next.js
const IzinSiswa = models.IzinSiswa || model("IzinSiswa", IzinSiswaSchema);

export default IzinSiswa;