import mongoose from 'mongoose';

const LateRecordSchema = new mongoose.Schema({
  // Relasi ke Student menggunakan ID atau NIS (nipd)
  student_id: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Student', 
    required: true 
  },
  nipd: { type: String, required: true }, // Backup untuk query cepat
  arrival_time: { type: Date, default: Date.now }, // Jam kedatangan
  reason: { type: String, default: "-" }, // Alasan terlambat
  academic_year: { type: String, required: true }, // Contoh: "2023/2024"
  semester: { type: Number, enum: [1, 2], required: true },
  recorded_by: { type: String } // Nama petugas piket yang input
}, { timestamps: true });

// Indexing agar pencarian history per siswa cepat
LateRecordSchema.index({ nipd: 1, arrival_time: -1 });

export default mongoose.models.LateRecord || mongoose.model('LateRecord', LateRecordSchema);