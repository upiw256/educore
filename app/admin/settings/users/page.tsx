import React from 'react';
import dbConnect from '@/lib/mongodb';
import Teacher from '@/models/Teacher';
import User from '@/models/User';
import { ShieldAlert, Key, Fingerprint, Users } from 'lucide-react';
import UserTableControls from '@/components/admin/UserTableControls';
import UserRoleActions from '@/components/admin/UserRoleActions';

export default async function UserSettingsPage({
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

  // Logic Filter: Mencari di Nama atau NIP
  const filter: any = {};
  if (query) {
    filter.$or = [
      { nama: { $regex: query, $options: 'i' } },
      { nip: { $regex: query, $options: 'i' } },
    ];
  }

  // Fetch Data Guru dan Data User secara paralel
  const [teachers, totalTeachers, allUsers] = await Promise.all([
    Teacher.find(filter).sort({ nama: 1 }).skip(skip).limit(limit).lean(),
    Teacher.countDocuments(filter),
    User.find({}).lean(),
  ]);

  const totalPages = Math.ceil(totalTeachers / limit);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tighter flex items-center gap-3">
            <ShieldAlert className="text-orange-500 w-8 h-8" />
            Otoritas Sistem
          </h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">
            Manajemen Hak Akses Personil SMAN 1 Margaasih
          </p>
        </div>
      </div>

      {/* Kontrol Tabel: Search & Pagination */}
      <UserTableControls 
        query={query} 
        currentPage={currentPage} 
        totalPages={totalPages} 
      />

      {/* Tabel Utama */}
      <div className="glass-card rounded-[2rem] border border-slate-800/60 bg-[#0f172a]/40 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02] text-slate-500 text-[10px] uppercase tracking-[0.2em] font-black border-b border-slate-800/50">
                <th className="px-6 py-5">Identitas Personal</th>
                <th className="px-6 py-5 text-center">Status Akses</th>
                <th className="px-6 py-5 text-right">Konfigurasi Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {teachers.length > 0 ? (
                teachers.map((teacher: any) => {
                  // Cek apakah guru ini sudah punya akun
                  const userData: any = allUsers.find(
                    (u: any) => u.teacherId?.toString() === teacher._id.toString()
                  );
                  
                  return (
                    <tr key={teacher._id.toString()} className="hover:bg-white/[0.01] transition-all group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-orange-500 font-bold shadow-inner">
                            {teacher.nama.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-white uppercase tracking-tight block text-sm">
                              {teacher.nama}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <Fingerprint size={12} className="text-slate-600" />
                              <span className="text-[10px] text-slate-500 font-mono font-bold italic tracking-widest">
                                NIP: {teacher.nip || '-'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-center">
                        {userData ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">
                              {userData.role} Active
                            </span>
                          </div>
                        ) : (
                          <span className="text-[9px] text-slate-600 font-black uppercase tracking-widest opacity-50">
                            No Authority
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {/* Komponen Client untuk Tombol Role */}
                        <UserRoleActions 
                          teacherId={teacher._id.toString()}
                          teacherName={teacher.nama}
                          nip={teacher.nip}
                          currentRole={userData?.role}
                          userId={userData?._id.toString()}
                        />
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-32 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Users className="text-slate-700 w-10 h-10 animate-pulse" />
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-widest italic">
                        Personil tidak ditemukan...
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Footer Info */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800 flex items-start gap-3">
        <Key className="w-4 h-4 text-orange-500 mt-0.5" />
        <p className="text-[10px] text-slate-500 leading-relaxed uppercase tracking-tighter font-bold">
          Level akses menentukan menu yang tampil di sidebar. Piket mengelola izin masuk, sedangkan Kesiswaan mengelola poin pelanggaran.
        </p>
      </div>
    </div>
  );
}