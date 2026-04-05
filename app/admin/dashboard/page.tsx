
import React from 'react';
import { Megaphone, Calendar, ChevronRight } from 'lucide-react';
import dbConnect from '@/lib/mongodb';
import { cookies } from 'next/headers'; //
import { jwtVerify } from 'jose';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import LateRecord from '@/models/LateRecord';
import Pelanggaran from '@/models/Pelanggaran';
import User from '@/models/User';
import Pengumuman from '@/models/Pengumuman';
import SyncButton from "@/components/SyncButton";
import SyncPTKButton from '@/components/SyncPTKButton';
import SyncSekolahButton from '@/components/SyncSekolahButton';
import SchoolProfileCard from '@/components/SchoolProfileCard';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'secret123');

export default async function DashboardPage() {

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  let namaUser = "Pengguna";
  if (token) {
    try {
      const { payload } = await jwtVerify(token, SECRET_KEY);
      const userId = payload.id as string;

      // 2. Cari User dan Populate data Teacher untuk ambil Nama Asli
      const userData = await User.findById(userId)
        .populate({
          path: 'teacherId',
          model: Teacher,
          select: 'nama' // Hanya ambil field nama saja agar ringan
        })
        .lean();

      if (userData && userData.teacherId) {
        // @ts-ignore
        namaUser = userData.teacherId.nama;
      } else {
        // Fallback jika data teacher tidak ditemukan, pakai username (NIP)
        namaUser = payload.username as string;
      }
    } catch (error) {
      console.error("Gagal verifikasi profil di dashboard" + error);
    }
  }
  // 1. Ambil data asli dari MongoDB
  await dbConnect();
  const totalSiswa = await Student.countDocuments();
  const totalGuru = await Teacher.countDocuments({ jenis_ptk_id_str: /Guru/i }); // Hanya hitung yang jenis PTK-nya mengandung "Guru"
  const totalIzinPending = await LateRecord.countDocuments({createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
  const totalPelanggaran = await Pelanggaran.countDocuments({ date: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } });
  const pengumumanAktif = await Pengumuman.find({ isActive: true }).sort({ date: -1 }).limit(1).lean();
  const currentBerita = pengumumanAktif.length > 0 ? pengumumanAktif[0] : null;

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
    { label: 'Siswa Terlambat Minggu ini', value: totalIzinPending.toLocaleString(), desc: 'Siswa', color: 'text-warning', bg: 'bg-warning/10' },
    { label: 'Pelanggaran Minggu ini', value: totalPelanggaran.toLocaleString(), desc: 'Siswa', color: 'text-danger', bg: 'bg-danger/10' },
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
        <h1 className="text-3xl font-bold text-white">Welcome back, {namaUser} 👋</h1>
        <p className="text-slate-400 mt-1">Berikut adalah ringkasan aktivitas sekolah hari ini.</p>
      </div>

      {/* Announcements Section */}
      {currentBerita && (
        <div className="relative overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-orange-500/50 via-electric/50 to-purple-500/50">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-electric/10 to-purple-500/10 animate-pulse"></div>
          <div className="relative bg-[#0b1120] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between z-10 backdrop-blur-xl">
            <div className="flex gap-4 sm:gap-6 items-start">
              <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 sm:p-4 rounded-xl shadow-lg shadow-orange-500/20 shrink-0">
                <Megaphone className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">{currentBerita.title}</h3>
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider border border-orange-500/30">{currentBerita.type}</span>
                </div>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl whitespace-pre-wrap">
                  {currentBerita.content}
                </p>
                <div className="flex items-center gap-2 mt-4 text-xs font-semibold text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{new Date(currentBerita.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

      <SchoolProfileCard />

      {/* Shortcut Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-linear-to-br from-electric/20 to-transparent border border-electric/30">
          <h4 className="font-bold text-white mb-2">Sync Dapodik Terjadwal</h4>
          <p className="text-sm text-slate-400 mb-4">Pastikan data siswa dan PTK selalu sinkron dengan server pusat setiap hari.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box Kiri: Sync Siswa */}
            <div className="p-6 rounded-2xl bg-linear-to-br from-electric/20 to-transparent border border-electric/30">
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
            <div className="mt-2 p-6 rounded-2xl bg-slate-800/40 border border-slate-700">
                <h4 className="font-bold text-white mb-2">Sync Data Sekolah</h4>
                <p className="text-sm text-slate-400 mb-4">Update data sekolah SMAN 1 Margaasih.</p>
                <SyncSekolahButton />
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