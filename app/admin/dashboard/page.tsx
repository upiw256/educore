import React from 'react';
import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import SyncButton from "@/components/SyncButton";
import SyncPTKButton from '@/components/SyncPTKButton';

export default async function DashboardPage() {
  // 1. Ambil data asli dari MongoDB
  await dbConnect();
  const totalSiswa = await Student.countDocuments();
  const totalGuru = await Teacher.countDocuments();

  // 2. Masukkan ke dalam array stats (UI tetap sama)
  const stats = [
    { 
      label: 'Total Siswa', 
      value: totalSiswa.toLocaleString(), 
      desc: 'Data Real-time', 
      color: 'text-electric', 
      bg: 'bg-electric/10' 
    },
    { 
      label: 'Total PTK (Guru)', 
      value: totalGuru.toLocaleString(), 
      desc: 'Data Dapodik', 
      color: 'text-white', 
      bg: 'bg-slate-800' 
    },
    { label: 'Siswa Izin (App)', value: '18', desc: 'Perlu Approval', color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Pelanggaran Hari Ini', value: '5', desc: 'Poin Masuk', color: 'text-danger', bg: 'bg-danger/10' },
  ];

  const recentActivity = [
    { name: 'Reza Kafri', class: 'Class 3', activity: 'Izin Sakit Approved', time: '2023-13 08:33', status: 'success' },
    { name: 'Rerin Sekolah', class: 'Class 12', activity: 'Student Marked Present', time: '2023-12 06:33', status: 'primary' },
    { name: 'Admin Sekolah', class: 'Class 1', activity: 'Student Marked Present', time: '2023-19 08:30', status: 'primary' },
    { name: 'Reza Sekolah', class: 'Class 13', activity: 'Izin Sakit Approved', time: '2023-12 09:33', status: 'success' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Welcome back, Reza! 👋</h1>
        <p className="text-slate-400 mt-1">Berikut adalah ringkasan aktivitas sekolah hari ini.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, i) => (
          <div key={i} className="glass-card p-6 rounded-2xl border-slate-800/50 hover:border-electric/50 transition-all cursor-default group">
            <p className="text-slate-400 text-sm font-medium">{item.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className={`text-3xl font-bold ${item.color}`}>{item.value}</h3>
              <span className="text-[10px] bg-slate-800 px-2 py-1 rounded-md text-slate-400 group-hover:text-electric transition-colors">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card rounded-2xl overflow-hidden border-slate-800/50">
        <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-white/[0.02]">
          <h3 className="font-semibold text-lg text-white">Recent Activity (Mobile App)</h3>
          <button className="text-sm text-electric hover:underline cursor-pointer font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-500 text-xs uppercase tracking-wider bg-slate-900/50">
                <th className="px-6 py-4 font-semibold">Student Name</th>
                <th className="px-6 py-4 font-semibold">Class</th>
                <th className="px-6 py-4 font-semibold">Activity</th>
                <th className="px-6 py-4 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-sm">
              {recentActivity.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                      <img src={`https://ui-avatars.com/api/?name=${row.name}&background=random`} alt="avatar" />
                    </div>
                    <span className="font-medium text-slate-200">{row.name}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">{row.class}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-[11px] font-medium ${
                      row.status === 'success' ? 'bg-success/10 text-success' : 'bg-electric/10 text-electric'
                    }`}>
                      {row.activity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-xs">{row.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shortcut Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-electric/20 to-transparent border border-electric/30">
          <h4 className="font-bold text-white mb-2">Sync Dapodik Terjadwal</h4>
          <p className="text-sm text-slate-400 mb-4">Pastikan data siswa dan PTK selalu sinkron dengan server pusat setiap hari.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box Kiri: Sync Siswa */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-electric/20 to-transparent border border-electric/30">
                <h4 className="font-bold text-white mb-2">Sync Siswa</h4>
                <p className="text-sm text-slate-400 mb-4">Update data peserta didik langsung dari server pusat.</p>
                <SyncButton /> 
            </div>

            {/* Box Kanan: Sync PTK (Guru) */}
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700">
                <h4 className="font-bold text-white mb-2">Sync PTK (Guru)</h4>
                <p className="text-sm text-slate-400 mb-4">Update data Guru dan Tenaga Kependidikan SMAN 1 Margaasih.</p>
                <SyncPTKButton />
            </div>
            </div>
        </div>
        <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700">
          <h4 className="font-bold text-white mb-2">Pusat Bantuan (IT Support)</h4>
          <p className="text-sm text-slate-400 mb-4">Jika ada kendala pada koneksi Web Service Dapodik, silakan hubungi tim teknis.</p>
          <button className="border border-slate-600 hover:border-slate-400 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer text-white">
            Hubungi Support
          </button>
        </div>
      </div>
    </div>
  );
}