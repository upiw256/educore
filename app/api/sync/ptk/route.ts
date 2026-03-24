import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Teacher from '@/models/Teacher'; // Pastikan model Teacher sudah ada

export async function POST() {
  try {
    await dbConnect();
    const BARRIER = process.env.DAPODIK_BARRIER || "margaasih";

    // Ambil data dari API Guru
    const response = await fetch(`${process.env.DAPODIK_API_URL}/guru`, {
      headers: { "X-Barrier": BARRIER },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error("Gagal mengambil data Guru");

    const data = await response.json();
    const rows = data.rows || [];
    const totalCount = data.results || rows.length;

    // Mapping untuk Bulk Upsert berdasarkan ptk_id
    const ops = rows.map((ptk: any) => ({
      updateOne: {
        filter: { ptk_id: ptk.ptk_id },
        update: { 
          $set: { 
            nama: ptk.nama,
            nuptk: ptk.nuptk,
            nip: ptk.nip,
            tempat_lahir: ptk.tempat_lahir, // <-- Tambahan
            tanggal_lahir: ptk.tanggal_lahir, // <-- Tambahan
            jenis_ptk_id_str: ptk.jenis_ptk_id_str, // <-- Tambahan
            jabatan_ptk_id_str: ptk.jabatan_ptk_id_str, // <-- Tambahan
            status_kepegawaian_id_str: ptk.status_kepegawaian_id_str // <-- Tambahan
          } 
        },
        upsert: true
      }
    }));

    if (ops.length > 0) {
      await Teacher.bulkWrite(ops);
    }

    return NextResponse.json({ success: true, total: totalCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}