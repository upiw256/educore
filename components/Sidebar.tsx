"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, GraduationCap, Users, ScrollText, 
  BookXIcon, FileLock, UserXIcon, SettingsIcon 
} from 'lucide-react';

// Pemetaan icon berdasarkan string iconName
const IconMap: { [key: string]: React.ElementType } = {
  dashboard: LayoutDashboard,
  siswa: GraduationCap,
  guru: Users,
  jadwal: ScrollText,
  late: BookXIcon,
  permission: FileLock,
  violation: UserXIcon,
  settings: SettingsIcon,
};

interface MenuItem {
  title: string;
  path: string; // Wajib ada path
  iconName: string;
}

interface MenuSection {
  label?: string; // Label pembatas (opsional)
  items: MenuItem[];
}

interface SidebarProps {
  sections: MenuSection[];
}

export default function Sidebar({ sections }: SidebarProps) {
  const pathname = usePathname();

  const getLinkClass = (path: string) => {
    // Mengecek apakah link sedang aktif berdasarkan URL browser
    const isActive = pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
      isActive 
        ? 'bg-blue-600/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
        : 'hover:bg-slate-800 text-slate-400'
    }`;
  };

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col h-screen sticky top-0 overflow-y-auto">
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="p-2 bg-blue-600/10 rounded-lg">
          <LayoutDashboard className="w-6 h-6 text-blue-500" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Edu<span className="text-blue-500">Core</span>
        </span>
      </div>
      
      <nav className="flex-1 p-4 space-y-6 mt-4">
        {sections.map((section, sIndex) => (
          <div key={sIndex} className="space-y-1">
            {/* Render Header Section jika ada label */}
            {section.label && (
              <div className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 mt-4">
                {section.label}
              </div>
            )}

            {/* Looping semua item menu sebagai Link */}
            {section.items.map((item, iIndex) => {
              const IconComponent = IconMap[item.iconName] || LayoutDashboard;
              
              return (
                <Link 
                  key={iIndex} 
                  href={item.path} 
                  className={getLinkClass(item.path)}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="truncate">{item.title}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      
      {/* Footer info versi aplikasi */}
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-700 font-mono font-bold uppercase tracking-widest">
          v1.0.2-stable
        </p>
      </div>
    </aside>
  );
}