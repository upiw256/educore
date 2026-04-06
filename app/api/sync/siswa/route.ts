import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
export async function GET() {
  try {
    await dbConnect();

    // Kita ambil data yang sudah di-sync tadi
    const students = await Student.find({ is_active: true })
      .select('nama nipd nama_rombel') // Ambil yang penting aja biar kenceng
      .sort({ nama: 1 });

    return NextResponse.json(students);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
export async function POST() {
  try {
    await dbConnect();
    const BARRIER = process.env.DAPODIK_BARRIER || "margaasih";

    // 1. Tarik SEMUA data sekaligus
    const response = await fetch(`${process.env.DAPODIK_API_URL}/api/siswa`, {
      headers: { "X-Barrier": BARRIER },
      // Tambahkan cache: 'no-store' agar selalu ambil data terbaru
      cache: 'no-store'
    });

    if (!response.ok) throw new Error("Gagal mengambil data dari API Margaasih");

    const data = await response.json();
    const rows = data.rows || []; // Ini akan berisi 1.542 data langsung
    const totalCount = data.results || rows.length;

    // 2. Siapkan Operasi Bulk Upsert
    const ops = rows.map((siswa: any) => ({
      updateOne: {
        filter: { peserta_didik_id: siswa.peserta_didik_id },
        update: {
          $set: {
            nama: siswa.nama,
            nisn: siswa.nisn,
            nama_rombel: siswa.nama_rombel,
            nipd: siswa.nipd
          }
        },
        upsert: true
      }
    }));

    // 3. Eksekusi ke MongoDB
    if (ops.length > 0) {
      await Student.bulkWrite(ops);
    }

    return NextResponse.json({
      success: true,
      total: totalCount
    });

  } catch (error: any) {
    console.error("Sync Error:", error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}