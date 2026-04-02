import React from 'react';
import dbConnect from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import { Users, Briefcase, Calendar, Fingerprint } from 'lucide-react';
import GuruTableControls from '@/components/admin/GuruTableControls';

export default async function TeacherListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await dbConnect();
  
  // Unwrap searchParams untuk Next.js 15
  const params = await searchParams;
  const query = params.q || '';
  const currentPage = Number(params.page) || 1;
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  // Filter Logic
  const filter: any = {};
  if (query) {
    filter.$or = [
      { nama: { $regex: query, $options: 'i' } },
      { nip: { $regex: query, $options: 'i' } },
      { nuptk: { $regex: query, $options: 'i' } },
    ];
  }

  // Fetch Data
  const [teachers, totalTeachers] = await Promise.all([
    Teacher.find(filter).sort({ nama: 1 }).skip(skip).limit(limit).lean(),
    Teacher.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalTeachers / limit);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="text-electric w-7 h-7" />
            Data Guru & Tenaga Kependidikan
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Terdeteksi <span className="text-slate-200 font-semibold">{totalTeachers}</span> personil di SMAN 1 Margaasih.
          </p>
        </div>
      </div>

      {/* Table Controls (Search & Pagination) */}
      <GuruTableControls 
        query={query} 
        currentPage={currentPage} 
        totalPages={totalPages} 
      />

      {/* Main Table */}
      <div className="glass-card rounded-2xl border border-slate-800/50 overflow-hidden bg-slate-900/20 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
                <th className="px-6 py-5">Identitas & Nama</th>
                <th className="px-6 py-5">Nomor Induk</th>
                <th className="px-6 py-5">Status & Jabatan</th>
                <th className="px-6 py-5 text-right">TTL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {teachers.length > 0 ? (
                teachers.map((guru: any) => {
                  const isPNS = guru.status_kepegawaian_id_str?.match(/PNS|PPPK/i);
                  
                  return (
                    <tr key={guru._id.toString()} className="hover:bg-white/[0.03] transition-all group">
                      {/* Kolom Nama */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-800 to-navy-card border border-slate-700 flex items-center justify-center text-electric font-bold shadow-inner group-hover:border-electric/30 transition-colors">
                            {guru.nama.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-200 group-hover:text-white transition-colors block">
                              {guru.nama}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono tracking-tight">
                              ID: {guru.ptk_id || '-'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Kolom NIP/NUPTK */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                            {/* Baris NIP */}
                            <div className="flex items-center gap-2 text-xs">
                            <Fingerprint className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                            <div className="flex gap-1.5 font-mono">
                                <span className="text-slate-500 font-bold tracking-tight">NIP.</span>
                                <span className="text-slate-300 tracking-wider">{guru.nip || '-'}</span>
                            </div>
                            </div>

                            {/* Baris NUPTK */}
                            <div className="flex items-center gap-2 text-[11px]">
                            {/* Spacer agar sejajar dengan baris atas yang punya icon */}
                            <div className="w-3.5 h-3.5 shrink-0" /> 
                            <div className="flex gap-1.5 font-mono">
                                <span className="text-slate-600 font-bold tracking-tight">NUPTK.</span>
                                <span className="text-slate-500 tracking-wider">{guru.nuptk || '-'}</span>
                            </div>
                            </div>
                        </div>
                    </td>

                      {/* Kolom Status & Jabatan */}
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            {/* Badge Status Pegawai */}
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${
                              isPNS 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            }`}>
                              {guru.status_kepegawaian_id_str || 'TIDAK TETAP'}
                            </span>
                            
                            {/* Badge Jenis PTK */}
                            <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-slate-800 text-slate-400 border border-slate-700">
                              {guru.jenis_ptk_id_str || 'GURU'}
                            </span>
                          </div>

                          <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1.5 mt-0.5">
                            <Briefcase className="w-3 h-3 text-electric" />
                            {guru.jabatan_ptk_id_str || 'Guru Matapelajaran'}
                          </span>
                        </div>
                      </td>

                      {/* Kolom TTL */}
                      <td className="px-6 py-4 text-left"> {/* Berubah ke text-left */}
                        <div className="flex flex-col items-start gap-1"> {/* Berubah ke items-start */}
                            <span className="text-slate-300 text-xs font-medium">
                            {guru.tempat_lahir || 'Lokasi tidak ada'}
                            </span>
                            <span className="text-slate-500 text-[10px] flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-600" />
                            {guru.tanggal_lahir || '-- -- ----'}
                            </span>
                        </div>
                        </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center animate-pulse">
                        <Users className="w-6 h-6 text-slate-700" />
                      </div>
                      <p className="text-slate-500 text-sm italic">Data PTK tidak ditemukan dalam database...</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
        <div className="w-5 h-5 rounded bg-electric/20 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-electric text-[10px] font-bold">!</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-tight">
          <strong>Catatan:</strong> Data ini bersifat Read-Only. Segala perubahan pada Nama, NIP, atau Status Kepegawaian harus dilakukan melalui aplikasi <span className="text-slate-400">Dapodik Pusat</span> oleh operator sekolah agar sinkronisasi tetap akurat.
        </p>
      </div>
    </div>
  );
}