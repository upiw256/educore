"use client";

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, GraduationCap, Users, ScrollText, 
  BookXIcon, FileLock, UserXIcon, SettingsIcon, LogOut, Loader2, Megaphone 
} from 'lucide-react';

const IconMap: { [key: string]: React.ElementType } = {
  dashboard: LayoutDashboard,
  siswa: GraduationCap,
  guru: Users,
  jadwal: ScrollText,
  late: BookXIcon,
  permission: FileLock,
  violation: UserXIcon,
  settings: SettingsIcon,
  megaphone: Megaphone,
};

interface MenuItem {
  title: string;
  path: string;
  iconName: string;
  roles?: string[]; // Tambahkan properti opsional untuk hak akses
}

interface MenuSection {
  label?: string;
  items: MenuItem[];
}

interface SidebarProps {
  sections: MenuSection[];
  userRole: string; // Tambahkan prop role user (admin/piket/kesiswaan)
}

export default function Sidebar({ sections, userRole }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/');
        router.refresh();
      }
    } catch (error) {
      console.error("Logout gagal:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getLinkClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
      isActive 
        ? 'bg-blue-600/10 text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.1)]' 
        : 'hover:bg-slate-800 text-slate-400'
    }`;
  };

  return (
    <aside className="w-64 bg-[#0f172a] border-r border-slate-800 flex flex-col h-screen sticky top-0 overflow-y-auto">
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="p-2 bg-blue-600/10 rounded-lg">
          <LayoutDashboard className="w-6 h-6 text-blue-500" />
        </div>
        <span className="text-xl font-bold tracking-tight text-white">
          Edu<span className="text-blue-500">Core</span>
        </span>
      </div>
      
      <nav className="flex-1 p-4 space-y-6 mt-4">
        {sections.map((section, sIndex) => {
          // Filter item berdasarkan role user
          const filteredItems = section.items.filter(item => {
            if (userRole === 'admin') return true; // Admin lihat semua
            if (!item.roles) return true; // Item tanpa batasan role bisa dilihat semua
            return item.roles.includes(userRole); // Hanya tampil jika role user terdaftar
          });

          // Jangan render section jika tidak ada item yang boleh dilihat
          if (filteredItems.length === 0) return null;

          return (
            <div key={sIndex} className="space-y-1">
              {section.label && (
                <div className="px-4 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2 mt-4">
                  {section.label}
                </div>
              )}

              {filteredItems.map((item, iIndex) => {
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
          );
        })}

        <div className="pt-4 mt-4 border-t border-slate-800/50">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all font-medium text-sm group"
          >
            {isLoggingOut ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />}
            <span>{isLoggingOut ? 'Signing out...' : 'Keluar Sistem'}</span>
          </button>
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-800 text-center">
        <p className="text-[10px] text-slate-700 font-mono font-bold uppercase tracking-widest">
          v1.0.2-stable
        </p>
      </div>
    </aside>
  );
}