// app/admin/jadwal/page.tsx
import { getDaftarKelas } from '@/lib/db/getClasses';
import AdminJadwalClient from '@/components/AdminJadwalClient';

export default async function AdminJadwalPage() {
  const daftarKelas = await getDaftarKelas();

  return (
    <div className="min-h-screen bg-[#020617] p-8">
       <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-white">EduCore Dashboard</h1>
          <p className="text-slate-500">Manajemen & Monitoring Jadwal Real-time</p>
       </div>
       
       {/* Sekarang datanya tampil di sini, tidak pindah URL */}
       <AdminJadwalClient daftarKelas={daftarKelas} />
    </div>
  );
}