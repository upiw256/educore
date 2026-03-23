import mongoose from 'mongoose';

const StudentSchema = new mongoose.Schema({
  peserta_didik_id: { type: String, unique: true }, // UUID dari Dapodik
  nama: String,
  nisn: String,
  nipd: String,
  nama_rombel: String,
  jenis_kelamin: String,
  nik: String,
  tempat_lahir: String,
  tanggal_lahir: Date,
  nama_ibu: String,
  // Fitur tambahan EduCore
  points: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model('Student', StudentSchema);