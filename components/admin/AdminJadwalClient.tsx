"use client";
import { useState } from "react";
import ClassSelector from "@/components/ClassSelector";
import { getJadwalByKelas } from "@/lib/actions/fetchJadwal";
import { Clock, Calendar } from "lucide-react";

export default function AdminJadwalClient({ daftarKelas }: { daftarKelas: string[] }) {
  const [jadwal, setJadwal] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSelectKelas = async (kelas: string) => {
    if (!kelas) {
      setJadwal(null);
      return;
    }
    setLoading(true);
    const data = await getJadwalByKelas(kelas); 
    if (data) setJadwal(data);
    setLoading(false);
  };

  return (
    <div className="space-y-8 w-full max-w-[1600px] mx-auto pb-20 px-4">
      <div className="max-w-md mx-auto">
        <ClassSelector daftarKelas={daftarKelas} onSelect={handleSelectKelas} />
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 mb-4"></div>
          <p className="text-slate-400 font-medium animate-pulse">Menyusun Tabel Jadwal...</p>
        </div>
      )}

      {jadwal && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 animate-in fade-in duration-500">
          {Object.keys(jadwal.data_per_hari).map((hari, index) => {
            // Layout: Senin & Selasa (Atas, Span 3), Rabu-Jumat (Bawah, Span 2)
            const gridSpan = index < 2 ? "xl:col-span-3" : "xl:col-span-2";

            return (
              <div key={hari} className={`${gridSpan} flex flex-col`}>
                {/* Header Kolom (Hari) */}
                <div className="bg-blue-700 p-3 rounded-t-xl border-x border-t border-slate-700 shadow-lg">
                  <div className="flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4 text-white/70" />
                    <h3 className="text-white font-black text-center uppercase tracking-widest text-sm">{hari}</h3>
                  </div>
                </div>

                {/* Body Tabel */}
                <div className="overflow-hidden border border-slate-700 rounded-b-xl shadow-2xl bg-[#0f172a]">
                  <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                      <tr className="bg-slate-800/50 text-[10px] uppercase text-slate-500 border-b border-slate-700">
                        <th className="px-3 py-2 font-bold w-14 text-center border-r border-slate-700">Jam</th>
                        <th className="px-3 py-2 font-bold">Mata Pelajaran & Guru</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {jadwal.data_per_hari[hari]
                        .slice()
                        .sort((a: any, b: any) => a.waktu.localeCompare(b.waktu)) // Sortir berdasarkan jam operasional
                        .map((item: any, idx: number) => {
                          const isIstirahat = item.jam_ke === 99 || item.kegiatan[0]?.guru.toUpperCase().includes("ISTIRAHAT");
                          
                          return (
                            <tr 
                              key={idx} 
                              className={`transition-colors hover:bg-blue-600/5 ${isIstirahat ? 'bg-amber-500/5' : ''}`}
                            >
                              {/* Kolom Nomor Jam */}
                              <td className="px-2 py-3 text-center border-r border-slate-800/50 align-middle">
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                  isIstirahat ? 'bg-amber-500/10 text-amber-500' : 'bg-blue-500/10 text-blue-400'
                                }`}>
                                  {isIstirahat ? 'REST' : item.jam_ke}
                                </span>
                              </td>

                              {/* Kolom Konten (Mapel + Guru + Waktu) */}
                              <td className="px-3 py-3">
                                <div className="flex flex-col gap-1">
                                  {item.kegiatan.map((k: any, ki: number) => (
                                    <div key={ki}>
                                      <p className={`text-[12px] font-bold leading-tight ${isIstirahat ? 'text-amber-400' : 'text-slate-100'}`}>
                                        {k.mapel !== "-" ? k.mapel : k.guru}
                                      </p>
                                      {k.mapel !== "-" && (
                                        <p className="text-[10px] text-slate-500 mt-0.5 italic truncate font-medium">
                                          {k.guru}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                  {/* Info Waktu di dalam sel yang sama (ala Excel) */}
                                  <div className="flex items-center gap-1 mt-1 opacity-60">
                                    <Clock className="w-2.5 h-2.5 text-slate-400" />
                                    <span className="text-[9px] font-mono font-bold text-slate-400">{item.waktu}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}