import mongoose from "mongoose";

const PelanggaranSchema = new mongoose.Schema({
  nis: { type: String, required: true }, // Kita pakai nis sesuai standar API Izin Kakak
  name: { type: String, required: true },
  className: { type: String, required: true },
  type: { type: String, required: true },
  poin: { type: Number, required: true },
  description: { type: String },
  date: { type: Date, default: Date.now }
});

export default mongoose.models.Pelanggaran || mongoose.model("Pelanggaran", PelanggaranSchema);