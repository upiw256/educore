'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Menu, X } from 'lucide-react'; 
import DapodikStatus from '@/components/DapodikStatus';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
    // 1. Tambahkan h-screen dan overflow-hidden pada container utama
    <div className="flex h-screen w-full bg-[#0b1120] text-slate-200 overflow-hidden">
      
      {/* Overlay untuk mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. SIDEBAR: Paksa h-full (mengisi h-screen container) agar tidak terpotong */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out 
        lg:relative lg:translate-x-0 w-64 h-full border-r border-slate-800/50 bg-[#0b1120]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar sections={menuData} />
      </aside>

      {/* 3. MAIN AREA: Tambahkan h-full dan overflow-y-auto agar kontennya saja yang bisa di-scroll */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Header Tetap Di Atas (Sticky) */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-4 lg:px-8 bg-[#0b1120]/80 backdrop-blur-xl shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 bg-slate-800 rounded-xl lg:hidden text-orange-500"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <DapodikStatus />
          </div>

          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-white italic uppercase tracking-tighter">Admin Sekolah</p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">Master Administrator</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin+Sekolah&background=0B1120&color=3B82F6" alt="avatar" />
             </div>
          </div>
        </header>

        {/* AREA SCROLL: Di sini konten akan ter-scroll secara independen */}
        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 p-6 lg:p-10">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}