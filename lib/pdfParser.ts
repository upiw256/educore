// lib/pdfParser.ts

// ==========================================
// 1. KAMUS & PEMBERSIH KODE / WAKTU (Ide Hebat dari Python-mu!)
// ==========================================

export function perbaikiWaktu(waktuRaw: string): string {
  if (!waktuRaw) return "-";
  
  // Normalisasi: Ubah titik dua (:) jadi titik (.)
  let w = waktuRaw.replace(/:/g, '.').trim();
  
  // KAMUS PERBAIKAN WAKTU
  const KAMUS_WAKTU: Record<string, string> = {
    "12.40 - 13.20": "12.10 - 13.20",
    "07.10 - 07.50": "07.10 - 07.50",
  };
  
  return KAMUS_WAKTU[w] || w;
}

export function bersihkanKode(rawText: string, hari?: string): string[] {
  if (!rawText || rawText === "-") return [];

  // Pecah teks berdasarkan spasi
  const tokens = rawText.trim().split(/[\s\n]+/);
  const cleanedCodes: string[] = [];

  for (let token of tokens) {
    token = token.trim();
    if (!token) continue;

    // --- FIX TYPO SPESIFIK ---
    if (hari === "JUMAT" && token === "32A") {
      token = "35A";
    }

    // Fix Typo OCR (Amankan kode 2 digit seperti 24, 44)
    if (token.length > 2) {
      if (/^\d+8$/.test(token)) {
        token = token.slice(0, -1) + "B"; // 328 -> 32B
      } else if (/^\d+4$/.test(token)) {
        token = token.slice(0, -1) + "A"; // 774 -> 77A
      }
    }

    // Fix huruf mirip angka
    if (token === "O5") token = "05";
    else if (token === "l2") token = "12";

    cleanedCodes.push(token);
  }

  return cleanedCodes;
}

// ==========================================
// 2. CORE LOGIC (EKSTRAKSI TEKS)
// ==========================================

export function parseTeacherList(text: string) {
  const teachers: Record<string, any> = {};
  const lines = text.split('\n').map(l => l.trim()).filter(l => l !== "");

  lines.forEach((line, index) => {
    // Mode Satu Baris (seperti SMAN 1 Margaasih)
    const inlineMatch = line.match(/^(\d{1,2}[A-B]?)\.?\s+(.+?)\s+(\d{18})\s+(.+)$/i);
    
    if (inlineMatch) {
      const code = inlineMatch[1].toUpperCase();
      teachers[code] = {
        nama: inlineMatch[2].trim(),
        nip: inlineMatch[3],
        mapel: inlineMatch[4].trim()
      };
    }
  });

  return teachers;
}

export function parseScheduleGrid(text: string) {
  const schedules: any[] = [];
  const lines = text.split('\n').map(l => l.trim());
  
  // Kita siapkan daftar hari dan mulai dari -1, sama persis seperti Python-mu!
  const hariList = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  let currentHariIndex = -1; 

  lines.forEach(line => {
    // Cari jam pelajaran (bisa pakai titik 07.10 atau titik dua 07:10)
    const timeMatch = line.match(/(\d{2}[.:]\d{2})\s*-\s*(\d{2}[.:]\d{2})/);
    
    if (timeMatch) {
      // Panggil fungsi buatanmu!
      const waktuBersih = perbaikiWaktu(timeMatch[0]);
      
      // --- TRIK RAHASIA DARI PYTHON ---
      // Kalau ketemu jam 06.30, berarti hari baru telah dimulai! Hore!
      if (waktuBersih.includes("06.3")) {
        currentHariIndex++;
      }
      
      // Ambil nama hari sesuai urutan, kalau kelewat batas kita tulis "Lainnya"
      const currentDay = currentHariIndex >= 0 && currentHariIndex < hariList.length 
        ? hariList[currentHariIndex] 
        : "Lainnya";
      
      const afterTime = line.split(timeMatch[2])[1] || "";
      const tokens = afterTime.trim().split(/\s+/);
      
      const period = parseInt(tokens[0]) || 0;
      const rawCodes = tokens.slice(1).join(" "); 

      // Panggil fungsi pembersih kode
      const finalCodes = bersihkanKode(rawCodes, currentDay.toUpperCase());

      finalCodes.forEach((code, idx) => {
        schedules.push({
          day: currentDay,
          time: waktuBersih,
          period: period,
          rombel: `Kelas ${idx + 1}`, 
          teacherCode: code
        });
      });
    }
  });

  return schedules;
}