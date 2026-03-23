import mongoose from 'mongoose';

const TeacherSchema = new mongoose.Schema({
  ptk_id: { type: String, unique: true, required: true },
  nama: String,
  nuptk: String,
  nip: String,
  tempat_lahir: String,
  tanggal_lahir: String,
  jenis_ptk_id_str: String,
  jabatan_ptk_id_str: String,
  status_kepegawaian_id_str: String,
}, { timestamps: true });

export default mongoose.models.Teacher || mongoose.model('Teacher', TeacherSchema);