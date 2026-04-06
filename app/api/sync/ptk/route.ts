import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Teacher from '@/models/Teacher';

// METODE GET: Untuk mengambil data guru (Kepala Sekolah)
export async function GET(request: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const jabatan = searchParams.get('jabatan');

    // Jika jabatan kosong, ambil semua guru agar tidak 404
    const query = jabatan
      ? { jenis_ptk_id_str: { $regex: new RegExp(jabatan, "i") } }
      : {};

    const teachers = await Teacher.find(query).limit(10);

    // KEMBALIKAN ARRAY KOSONG [] JIKA DATA TIDAK ADA (STATUS 200)
    // Ini supaya frontend tidak menganggapnya error 404
    return NextResponse.json(teachers || [], { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// METODE POST: Untuk sinkronisasi data dari API Dapodik
export async function POST() {
  try {
    await dbConnect();
    const BARRIER = process.env.DAPODIK_BARRIER || "margaasih";

    const response = await fetch(`${process.env.DAPODIK_API_URL}/api/guru`, {
      headers: { "X-Barrier": BARRIER },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error("Gagal mengambil data Guru");

    const data = await response.json();
    const rows = data.rows || [];

    const ops = rows.map((ptk: any) => ({
      updateOne: {
        filter: { ptk_id: ptk.ptk_id },
        update: {
          $set: {
            nama: ptk.nama,
            nuptk: ptk.nuptk,
            nip: ptk.nip,
            jenis_ptk_id_str: ptk.jenis_ptk_id_str,
            jabatan_ptk_id_str: ptk.jabatan_ptk_id_str,
            status_kepegawaian_id_str: ptk.status_kepegawaian_id_str
          }
        },
        upsert: true
      }
    }));

    if (ops.length > 0) {
      await Teacher.bulkWrite(ops);
    }

    return NextResponse.json({ success: true, total: rows.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}