import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Pelanggaran from "@/models/Pelanggaran";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const summary = searchParams.get("summary");
    const search = searchParams.get("search") || "";

    if (summary === "true") {
      // LOGIKA AGREGASI: Menghitung total poin per siswa
      const rekap = await Pelanggaran.aggregate([
        {
          $group: {
            _id: "$nis", // Kelompokkan berdasarkan NIS
            name: { $first: "$name" },
            className: { $first: "$className" },
            totalPoin: { $sum: "$poin" }, // Jumlahkan poinnya
            nis: { $first: "$nis" }
          }
        },
        {
          // Filter pencarian berdasarkan nama atau NIS
          $match: {
            $or: [
              { name: { $regex: search, $options: "i" } },
              { nis: { $regex: search, $options: "i" } }
            ]
          }
        },
        { $sort: { totalPoin: -1 } } // Urutkan dari poin terbesar
      ]);

      return NextResponse.json(rekap);
    }

    // Jika bukan summary, ambil semua data biasa
    const data = await Pelanggaran.find({}).sort({ date: -1 });
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- LOGIKA 3: SIMPAN DATA BARU ---
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();

    // Log untuk debugging: cek apa saja yang masuk ke API
    console.log("Payload Masuk:", body);

    // Validasi lebih ketat
    if (!body.nis || !body.name || !body.type || !body.poin) {
      return NextResponse.json(
        { error: "Data tidak lengkap! NIS, Nama, Tipe, dan Poin wajib ada." }, 
        { status: 400 }
      );
    }

    const newPelanggaran = await Pelanggaran.create({
      nis: body.nis,
      name: body.name,
      className: body.className || "Tanpa Kelas",
      type: body.type,
      poin: Number(body.poin),
      description: body.description || "-",
      date: body.date || new Date().toISOString()
    });

    return NextResponse.json(newPelanggaran);
  } catch (error: any) {
    console.error("POST Pelanggaran Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// --- LOGIKA 4: HAPUS DATA ---
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    await Pelanggaran.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}