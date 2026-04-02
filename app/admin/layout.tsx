'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/ui/Sidebar';
import { Menu, X } from 'lucide-react'; 
import DapodikStatus from '@/components/ui/DapodikStatus';
import Image from 'next/image';
import { menuData } from '@/lib/menu'; 
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userRole, setUserRole] = useState('guest'); // Default role
  const [teacherName, setTeacherName] = useState('User'); // Default name
  

  // Ambil data role saat mounting
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/auth/me'); // Buat endpoint ini untuk cek session
        const teacherRes = await fetch('/api/users/profile'); // Endpoint untuk ambil nama guru
        if (res.ok) {
          const data = await res.json();
          const teacherData = await teacherRes.json();
          setUserRole(data.role);
          setTeacherName(teacherData.nama || 'User');
        }
      } catch (err) {
        console.error("Gagal memuat profil");
      }
    };
    fetchUser();
  }, []);
  

  return (
    <div className="flex h-screen w-full bg-[#0b1120] text-slate-200 overflow-hidden">
      
      {/* Overlay untuk mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR: Kirim menuData dan userRole ke komponen Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out 
        lg:relative lg:translate-x-0 w-64 h-full border-r border-slate-800/50 bg-[#0b1120]
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar sections={menuData} userRole={userRole} />
      </aside>

      {/* MAIN AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
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
                <p className="text-sm font-black text-white italic uppercase tracking-tighter">
                  {teacherName === 'admin' ? 'Master Administrator' : teacherName.toUpperCase()}
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-[0.2em]">EduCore System</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden">
                <Image 
                  src={`https://ui-avatars.com/api/?name=${teacherName}&background=0B1120&color=3B82F6`} 
                  alt="avatar" 
                  width={40} 
                  height={40} 
                />
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 p-6 lg:p-10">
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}