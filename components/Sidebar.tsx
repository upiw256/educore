"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, GraduationCap, FileLock, Users, ScrollText, BookXIcon, UserXIcon, SettingsIcon } from 'lucide-react';
const IconMap: { [key: string]: React.ElementType } = {
  dashboard: LayoutDashboard,
  siswa: GraduationCap,
  guru: Users,
  jadwal: ScrollText
};

// Definisikan tipe untuk item menu
interface MenuItem {
  title: string;
  path: string;
  iconName: string; // Tipe data string
}

interface SidebarProps {
  menuItems: MenuItem[];
}

export default function Sidebar({ menuItems }: SidebarProps) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
      isActive 
        ? 'bg-electric/10 text-electric shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
        : 'hover:bg-slate-800 text-slate-400'
    }`;
  };

  return (
    <aside className="w-64 bg-navy-card border-r border-slate-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <svg viewBox="0 0 24 24" className="w-8 h-8 text-electric fill-current">
          <path d="M12 2L1 7l11 5 11-5-11-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span className="text-xl font-bold tracking-tight">
          Edu<span className="text-electric">Core</span>
        </span>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 mt-4">
        {/* LOOPING MENU DINAMIS DISINI */}
        {menuItems.map((item, index) => {
          // Ambil icon berdasarkan string iconName
          const IconComponent = IconMap[item.iconName] || LayoutDashboard;
          
          return (
            <Link key={index} href={item.path} className={getLinkClass(item.path)}>
              <IconComponent className="w-5 h-5" />
              {item.title}
            </Link>
          );
        })}

        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Piket
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-electric/20 hover:text-electric transition-all text-slate-400 cursor-pointer">
          <BookXIcon className="w-5 h-5" />
          Siswa Terlambah
        </button>
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-electric/20 hover:text-electric transition-all text-slate-400 cursor-pointer">
          <FileLock className="w-5 h-5" />
          Izin Masuk / Keluar
        </button>

        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Kesiswaan
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-electric/20 hover:text-electric transition-all text-slate-400 cursor-pointer">
          <UserXIcon className="w-5 h-5" />
          Pelanggaran
        </button>

        <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Setting
        </div>

        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-electric/20 hover:text-electric transition-all text-slate-400 cursor-pointer">
          <SettingsIcon className="w-5 h-5" />
          Users
        </button>
      </nav>
      
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-600 font-mono">v1.0.2-stable</p>
      </div>
    </aside>
  );
}