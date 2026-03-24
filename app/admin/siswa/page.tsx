import React from 'react';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import { GraduationCap } from 'lucide-react';
import SiswaTableControls from '@/components/SiswaTableControls';

export default async function StudentListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; rombel?: string }>;
}) {
  await dbConnect();
  
  // UNWRAP searchParams (Wajib di Next.js 15)
  const params = await searchParams;
  const query = params.q || '';
  const currentPage = Number(params.page) || 1;
  const currentRombel = params.rombel || '';
  
  const limit = 10;
  const skip = (currentPage - 1) * limit;

  const filter: any = {};
  if (query) {
    filter.$or = [
      { nama: { $regex: query, $options: 'i' } },
      { nisn: { $regex: query, $options: 'i' } },
    ];
  }
  if (currentRombel) {
    filter.nama_rombel = currentRombel;
  }

  const [students, totalStudents, rombels] = await Promise.all([
    Student.find(filter).sort({ nama: 1 }).skip(skip).limit(limit).lean(),
    Student.countDocuments(filter),
    Student.distinct('nama_rombel'),
  ]);

  const totalPages = Math.ceil(totalStudents / limit);

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <GraduationCap className="text-electric" />
          Daftar Peserta Didik
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Menampilkan {totalStudents} siswa yang tersinkronisasi.
        </p>
      </div>

      {/* Masukkan Komponen Client untuk Filter & Pagination */}
      <SiswaTableControls 
        query={query} 
        rombel={currentRombel} 
        rombels={rombels} 
        currentPage={currentPage}
        totalPages={totalPages}
      />

      {/* Table Section (Murni UI, Tidak ada event handler) */}
      <div className="glass-card rounded-2xl border border-slate-800/50 overflow-hidden bg-slate-900/20 mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                <th className="px-6 py-4">Nama Lengkap</th>
                <th className="px-6 py-4">NISN / NIPD</th>
                <th className="px-6 py-4">Rombongan Belajar</th>
                <th className="px-6 py-4">Status Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {students.length > 0 ? (
                students.map((siswa: any) => (
                  <tr key={siswa._id.toString()} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-electric">
                        {siswa.nama.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-200">{siswa.nama}</span>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">
                      <div>{siswa.nisn || '-'}</div>
                      <div className="text-[10px] text-slate-600">NIPD: {siswa.nipd || '-'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-electric/10 text-electric text-[11px] font-semibold">
                        {siswa.nama_rombel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      <span className="flex items-center gap-1.5 text-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
                        Terverifikasi
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-20 text-center text-slate-500 italic">Data siswa tidak ditemukan...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}