'use client';

import React, { useState } from 'react';
import { ShieldCheck, Clock, UserCheck, Trash2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface UserRoleProps {
  teacherId: string;
  teacherName: string;
  nip: string;
  currentRole?: string;
  userId?: string;
}

export default function UserRoleActions({ 
  teacherId, 
  teacherName, 
  nip, 
  currentRole, 
  userId 
}: UserRoleProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Fungsi untuk menetapkan atau mengubah Role
  const handleSetRole = async (role: string) => {
    if (loading) return;
    setLoading(true);
    
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          teacherId, 
          role,
          username: nip || teacherName.split(' ')[0].toLowerCase(), 
          password: "password123" // Password default untuk login pertama
        }),
      });

      if (res.ok) {
        // Refresh Server Component agar UI terupdate otomatis
        router.refresh(); 
      }
    } catch (error) {
      console.error("Gagal memperbarui akses:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk menghapus akses (Delete User)
  const handleRevoke = async () => {
    if (!userId || !confirm(`Cabut semua akses untuk ${teacherName}?`)) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Gagal mencabut akses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-end pr-4">
        <Loader2 size={18} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
      {/* Tombol Admin */}
      <button 
        onClick={() => handleSetRole('admin')}
        className={`p-2.5 rounded-xl transition-all border ${
          currentRole === 'admin' 
            ? 'text-orange-500 bg-orange-500/10 border-orange-500/20' 
            : 'text-slate-500 hover:text-orange-500 hover:bg-slate-800 border-transparent'
        }`}
        title="Jadikan Admin"
      >
        <ShieldCheck size={18} />
      </button>

      {/* Tombol Piket */}
      <button 
        onClick={() => handleSetRole('piket')}
        className={`p-2.5 rounded-xl transition-all border ${
          currentRole === 'piket' 
            ? 'text-blue-500 bg-blue-500/10 border-blue-500/20' 
            : 'text-slate-500 hover:text-blue-500 hover:bg-slate-800 border-transparent'
        }`}
        title="Akses Piket (Izin Keluar)"
      >
        <Clock size={18} />
      </button>

      {/* Tombol Kesiswaan */}
      <button 
        onClick={() => handleSetRole('kesiswaan')}
        className={`p-2.5 rounded-xl transition-all border ${
          currentRole === 'kesiswaan' 
            ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' 
            : 'text-slate-500 hover:text-emerald-500 hover:bg-slate-800 border-transparent'
        }`}
        title="Akses Kesiswaan (Poin Pelanggaran)"
      >
        <UserCheck size={18} />
      </button>

      {/* Tombol Hapus Akses */}
      {userId && (
        <button 
          onClick={handleRevoke}
          className="p-2.5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all border border-transparent"
          title="Hapus Akun User"
        >
          <Trash2 size={18} />
        </button>
      )}
    </div>
  );
}