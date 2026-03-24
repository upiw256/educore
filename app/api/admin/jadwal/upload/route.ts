import { NextResponse } from 'next/server';
import { parseTeacherList, parseScheduleGrid } from '@/lib/pdfParser';
import dbConnect from '@/lib/mongodb';
import Schedule from '@/models/Schedule';

// Gunakan require untuk menghindari masalah penamaan modul di Next.js 15
const PDFParseModule = require('pdf-parse');

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "File tidak ditemukan" }, { status: 400 });
    }

    // 1. Konversi File ke Uint8Array (Syarat Mutlak v2)
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let rawText = "";

    try {
      // 2. Deteksi Constructor (Menangani perbedaan export ES/CommonJS)
      const PDFClass = PDFParseModule.PDFParse || PDFParseModule.default || PDFParseModule;
      
      if (typeof PDFClass !== 'function') {
        throw new Error("Gagal memuat konstruktor PDFParse.");
      }

      // 3. Inisialisasi dengan opsi untuk mematikan font rendering (Mencegah error font)
      const parserInstance = new PDFClass(uint8Array, {
        disableFontFace: true,
        useSystemFonts: false
      });

      const result = await parserInstance.getText();
      rawText = result.text;

      // Log untuk memastikan teks terbaca di terminal VS Code
      console.log("--- SAMPEL TEKS PDF ---");
      console.log(rawText.substring(0, 500)); 
      console.log("-----------------------");

    } catch (parseErr: any) {
      console.error("Detail Parse Error:", parseErr);
      throw new Error("Gagal mengekstrak teks: " + parseErr.message);
    }

    if (!rawText || rawText.length < 50) {
      throw new Error("PDF berhasil dibaca tapi isinya kosong atau tidak valid.");
    }

    // 4. Jalankan Helper Parser (Logic Regex)
    const teacherMap = parseTeacherList(rawText);
    const schedules = parseScheduleGrid(rawText);

    console.log(`Ditemukan: ${Object.keys(teacherMap).length} Guru, ${schedules.length} Slot Jadwal`);

    // 5. Hubungkan Data & Simpan ke Database
    await dbConnect();

    const finalData = schedules.map(s => ({
      day: s.day,
      period: s.period,
      timeRange: s.time || "00.00-00.00",
      rombel: s.rombel,
      teacherCode: s.teacherCode,
      teacherName: teacherMap[s.teacherCode]?.nama || `Guru (${s.teacherCode})`,
      subject: teacherMap[s.teacherCode]?.mapel || "Mata Pelajaran",
      nip: teacherMap[s.teacherCode]?.nip || "",
      academicYear: "2025/2026",
      semester: "Genap"
    }));

    if (finalData.length > 0) {
      // Hapus data lama agar tidak duplikat
      await Schedule.deleteMany({});
      
      // Simpan data baru
      const savedData = await Schedule.insertMany(finalData);
      
      return NextResponse.json({ 
        success: true, 
        count: savedData.length,
        preview: finalData.slice(0, 5) 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "Data jadwal tidak ditemukan. Pastikan format tabel sesuai standar." 
      }, { status: 422 });
    }

  } catch (error: any) {
    console.error("POST API Error:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "Terjadi kesalahan internal." 
    }, { status: 500 });
  }
}