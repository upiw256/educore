import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import LateRecord from '@/models/LateRecord';
import Student from '@/models/Student';

// GET: Ambil data untuk Tabel Utama ATAU Detail History per Siswa
export async function GET(req: Request) {
  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const nipd = searchParams.get('nipd');
  const isDetail = searchParams.get('detail');

  try {
    // JIKA REQUEST DETAIL PER SISWA
    if (isDetail && nipd) {
      const history = await LateRecord.find({ nipd }).sort({ arrival_time: -1 });
      return NextResponse.json({ history });
    }

    // JIKA REQUEST UNTUK TABEL UTAMA (AGREGASI)
    const results = await LateRecord.aggregate([
      // 1. Grouping berdasarkan NIPD untuk hitung total terlambat
      {
        $group: {
          _id: "$nipd",
          lateCount: { $sum: 1 },
          lastIncidentDate: { $max: "$arrival_time" }
        }
      },
      // 2. Lookup ke koleksi students untuk ambil Nama & Kelas
      {
        $lookup: {
          from: "students",
          localField: "_id",
          foreignField: "nipd",
          as: "studentProfile"
        }
      },
      // 3. Unwind agar object tidak berbentuk array
      { $unwind: "$studentProfile" },
      // 4. Formatting data untuk Frontend
      {
        $project: {
          _id: 0,
          nis: "$_id",
          nisn: "$studentProfile.nisn",
          name: "$studentProfile.nama",
          className: "$studentProfile.nama_rombel",
          lateCount: 1,
          lastLateTime: { 
            $dateToString: { format: "%H:%M", date: "$lastIncidentDate", timezone: "+07:00" } 
          },
          lastLateDate: { 
            $dateToString: { format: "%d-%m-%Y", date: "$lastIncidentDate", timezone: "+07:00" } 
          },
          rawDate: "$lastIncidentDate"
        }
      },
      // 5. Urutkan yang terbaru di paling atas
      { $sort: { rawDate: -1 } }
    ]);

    return NextResponse.json(results);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Simpan Catatan Keterlambatan Baru
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { nipd, reason, academic_year, semester, recorded_by } = body;

    // Cari dulu data siswanya untuk dapet student_id (ObjectId)
    const student = await Student.findOne({ nipd });
    if (!student) {
      return NextResponse.json({ error: "Siswa tidak ditemukan" }, { status: 404 });
    }

    const newRecord = await LateRecord.create({
      student_id: student._id,
      nipd: nipd,
      arrival_time: new Date(), // Waktu otomatis saat ini
      reason: reason || "Lainnya",
      academic_year: academic_year || "2025/2026",
      semester: semester || 2,
      recorded_by: recorded_by || "Admin Piket"
    });

    return NextResponse.json({ success: true, data: newRecord });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Hapus Semua Catatan Terlambat Siswa (Opsional)
export async function DELETE(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id'); // Ambil ID unik record, bukan nipd siswa

  try {
    if (!id) throw new Error("ID required");
    await LateRecord.findByIdAndDelete(id); // Hapus spesifik record ini
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PATCH: Update Jam Terlambat (Edit)
export async function PATCH(req: Request) {
  await dbConnect();
  try {
    const { id, arrival_time } = await req.json(); // Ambil ID unik dan tanggal+jam penuh baru
    if (!id || !arrival_time) throw new Error("ID and arrival_time required");

    // Update record di database
    await LateRecord.findByIdAndUpdate(id, { arrival_time: new Date(arrival_time) });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}