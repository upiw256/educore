export interface Kegiatan {
  guru: string;
  mapel: string;
}

export interface JadwalItem {
  jam_ke: number;
  waktu: string;
  kegiatan: Kegiatan[];
}

export interface JadwalResponse {
  kelas: string;
  data_per_hari: {
    [hari: string]: JadwalItem[];
  };
}