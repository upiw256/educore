
import React from 'react';
import dbConnect from '@/lib/mongodb';
import { cookies } from 'next/headers'; //
import { jwtVerify } from 'jose';
import Student from '@/models/Student';
import Teacher from '@/models/Teacher';
import LateRecord from '@/models/LateRecord';
import Pelanggaran from '@/models/Pelanggaran';
import User from '@/models/User';
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