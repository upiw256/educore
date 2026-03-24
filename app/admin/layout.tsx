import React from 'react';
import Sidebar from '@/components/Sidebar';
import { LayoutDashboard, GraduationCap, Users } from 'lucide-react'; // Import icon yang dibutuhkan
import DapodikStatus from '@/components/DapodikStatus';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // SETTING MENU DISINI
  const menuData = [
    {
      items: [
        { title: "Dashboard", path: "/admin/dashboard", iconName: "dashboard" },
        { title: "Data Siswa", path: "/admin/siswa", iconName: "siswa" },
        { title: "Data Guru", path: "/admin/guru", iconName: "guru" },
        { title: "Jadwal", path: "/admin/jadwal", iconName: "jadwal" },
      ]
    },
    {
      label: "Piket",
      items: [
        { title: "Siswa Terlambat", path: "/admin/piket/terlambat", iconName: "late" },
        { title: "Izin Masuk / Keluar", path: "/admin/piket/izin", iconName: "permission" },
      ]
    },
    {
      label: "Kesiswaan",
      items: [
        { title: "Pelanggaran", path: "/admin/kesiswaan/pelanggaran", iconName: "violation" },
      ]
    },
    {
      label: "Sistem",
      items: [
        { title: "Manajemen User", path: "/admin/settings/users", iconName: "settings" },
      ]
    }
  ];

  return (
    <div className="flex min-h-screen bg-navy-dark text-slate-200">
      {/* Kirim adminMenus ke Sidebar */}
      <Sidebar sections={menuData} />

      <main className="flex-1 flex flex-col">
        {/* Navbar tetap sama */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-navy-dark/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            {/* Panggil Komponen Disini */}
            <DapodikStatus />
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-sm font-medium text-white">Admin Sekolah</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">Administrator</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin+Sekolah&background=0B1120&color=3B82F6" alt="avatar" />
             </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}