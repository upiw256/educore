// lib/api.ts

export interface JadwalItem {
  jam_ke: number;
  waktu: string;
  kegiatan: {
    guru: string;
    mapel: string;
  }[];
}

export interface ApiResponse {
  kelas: string;
  data_per_hari: {
    [hari: string]: JadwalItem[];
  };
}

export async function getJadwalByKelas(kelas: string): Promise<ApiResponse | null> {
  try {
    // URL sesuai dengan yang kamu berikan
    // Contoh: https://jadwalapi.sman1margaasih.sch.id/jadwal/kelas/X-1
    const response = await fetch(`https://jadwalapi.sman1margaasih.sch.id/jadwal/kelas/${kelas}`, {
      next: { revalidate: 3600 } // Cache selama 1 jam agar loading cepat
    });

    if (!response.ok) {
      throw new Error("Gagal mengambil data dari API");
    }

    const data: ApiResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching jadwal:", error);
    return null;
  }
}