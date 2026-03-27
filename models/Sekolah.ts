import mongoose, { Schema, Document } from "mongoose";

export interface ISekolah extends Document {
  sekolah_id: string;
  nama: string;
  nss: string;
  npsn: string;
  bentuk_pendidikan: string;
  status_sekolah: string;
  alamat: string;
  rt: string;
  rw: string;
  kode_pos: string;
  telepon: string;
  email: string;
  website: string;
  lintang: string;
  bujur: string;
  desa_kelurahan: string;
  kecamatan: string;
  kabupaten_kota: string;
  provinsi: string;
  last_sync: Date;
}

const SekolahSchema: Schema = new Schema(
  {
    sekolah_id: { type: String, required: true, unique: true }, // 47fe2769...
    nama: { type: String, required: true }, // SMAN 1 MARGAASIH
    nss: { type: String }, // 301020832016
    npsn: { type: String, required: true, unique: true }, // 20227907
    bentuk_pendidikan: { type: String }, // SMA
    status_sekolah: { type: String }, // Negeri
    alamat: { type: String }, // JL. TERUSAN TAMAN KOPO INDAH 3
    rt: { type: String },
    rw: { type: String },
    kode_pos: { type: String },
    telepon: { type: String }, // 02254438236
    email: { type: String },
    website: { type: String },
    lintang: { type: String }, // -6.971200000000
    bujur: { type: String }, // 107.548700000000
    desa_kelurahan: { type: String },
    kecamatan: { type: String },
    kabupaten_kota: { type: String },
    provinsi: { type: String },
    last_sync: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.models.Sekolah || mongoose.model<ISekolah>("Sekolah", SekolahSchema);