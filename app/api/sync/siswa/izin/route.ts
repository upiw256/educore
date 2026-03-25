import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import IzinSiswa from "@/models/IzinSiswa";

// 1. Interface untuk bantuan Type Safety (TypeScript)
interface IzinDocument {
  nis: string;
  name: string;
  className: string;
  type: "MASUK" | "KELUAR";
  reason: string;
  time: string;
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const isSummary = searchParams.get("summary") === "true";
    const search = searchParams.get("search") || "";
    const name = searchParams.get("name");
    const nis = searchParams.get("nis");

    // --- LOGIKA 1: SUMMARY (REKAP UNTUK TABEL UTAMA) ---
    if (isSummary) {
      const pipeline: any[] = [
        // Filter pencarian global jika ada
        ...(search ? [{ 
          $match: { 
            $or: [
              { name: { $regex: search, $options: "i" } },
              { nis: { $regex: search, $options: "i" } }
            ] 
          } 
        }] : []),
        // Grouping berdasarkan NIS untuk hitung jumlah izin
        {
          $group: {
            _id: "$nis", 
            name: { $first: "$name" },
            className: { $first: "$className" },
            countMasuk: {
              $sum: { $cond: [{ $eq: ["$type", "MASUK"] }, 1, 0] }
            },
            countKeluar: {
              $sum: { $cond: [{ $eq: ["$type", "KELUAR"] }, 1, 0] }
            },
            lastTime: { $max: "$time" }
          }
        },
        { $sort: { lastTime: -1 } }
      ];

      const summaryData = await IzinSiswa.aggregate(pipeline);

      // Map hasil agar sesuai dengan interface frontend (nis)
      const formattedData = summaryData.map((item) => ({
        nis: item._id,
        name: item.name,
        className: item.className,
        countMasuk: item.countMasuk,
        countKeluar: item.countKeluar,
        lastTime: item.lastTime
      }));

      return NextResponse.json(formattedData);
    }

    // --- LOGIKA 2: DETAIL HISTORY (UNTUK MODAL DETAIL) ---
    let detailFilter: any = {};
    
    // Pastikan menggunakan 'nis' karena di POST kita simpan sebagai 'nis'
    if (nis) {
      detailFilter.nis = nis;
    } else if (name) {
      detailFilter.name = { $regex: `^${name}$`, $options: "i" };
    }

    const history = await IzinSiswa.find(detailFilter).sort({ time: -1 });

    return NextResponse.json(history);

  } catch (error: any) {
    console.error("GET Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// 4. LOGIKA SIMPAN DATA BARU
export async function POST(req: Request) {
  try {
    await dbConnect();
    const body = await req.json();
    
    // Validasi input minimal
    if (!body.nipd || !body.name) {
      return NextResponse.json({ error: "NIS dan Nama wajib diisi" }, { status: 400 });
    }

    const newIzin = await IzinSiswa.create({
      nis: body.nipd, // Pastikan frontend kirim nipd, disimpan ke nis di DB
      name: body.name,
      className: body.className,
      type: body.type,
      reason: body.reason,
      time: body.time || new Date().toISOString()
    });

    return NextResponse.json(newIzin);
  } catch (error: any) {
    console.error("POST Error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// 5. LOGIKA HAPUS DATA
export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    await IzinSiswa.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}