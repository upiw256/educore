import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Sekolah from "@/models/Sekolah";
import Teacher from "@/models/Teacher";

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    
    // Ambil parameter dan decode (Next.js otomatis melakukan ini, tapi kita pastikan lagi)
    const jabatanQuery = searchParams.get('jabatan'); 

    let query = {};
    if (jabatanQuery) {
      // "i" berarti case-insensitive, jadi "kepala sekolah" atau "Kepala Sekolah" tetap ketemu
      query = { jenis_ptk_id_str: { $regex: new RegExp(jabatanQuery, "i") } };
    }

    const teachers = await Teacher.find(query);
    return NextResponse.json(teachers || []);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    await dbConnect();
    
    const response = await fetch("https://api.sman1margaasih.sch.id/api/sekolah", {
      method: "GET",
      headers: {
        "X-Barrier": process.env.NEXT_PUBLIC_BARRIER || "margaasih",
      },
    });

    const data = await response.json();
    if (!data || !data.rows) {
      return NextResponse.json({ success: false, message: "Data API kosong" }, { status: 404 });
    }

    // Ambil object rows dari API pusat
    const body = data.rows;

    // --- STRATEGI AMBIL SEMUA DATA ---
    // Kita spread (...body) semua datanya. 
    // Pastikan field di Model Mongoose Kakak namanya sama dengan field di JSON API.
    const result = await Sekolah.findOneAndUpdate(
      { sekolah_id: body.sekolah_id }, // Filter berdasarkan ID unik
      {
        ...body, // Ini akan memasukkan semua field seperti rt, rw, lintang, bujur, dll
        alamat: body.alamat_jalan, // Mapping manual jika nama field di API (alamat_jalan) beda dengan Model (alamat)
        telepon: body.nomor_telepon, // Mapping manual jika di API namanya nomor_telepon
        last_sync: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}