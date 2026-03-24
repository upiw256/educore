"use client";

import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation'; // Tambahkan useSearchParams

interface Props {
  query: string;
  rombel: string;
  rombels: string[];
  currentPage: number;
  totalPages: number;
}

export default function SiswaTableControls({ query, rombel, rombels, currentPage, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams(); // Ambil params yang sedang aktif

  const updateSearch = (name: string, value: string) => {
    // Gunakan URLSearchParams bawaan untuk mengolah query string
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }

    // Jika yang diubah adalah pencarian atau rombel, balikkan ke halaman 1
    if (name !== 'page') {
      params.set('page', '1');
    }

    // Push ke URL baru
    router.push(`/admin/siswa?${params.toString()}`);
    
    // Paksa Next.js untuk refresh server data
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            defaultValue={query}
            // Gunakan debounce sederhana jika ingin lebih halus, 
            // tapi untuk sekarang kita pakai onBlur atau tombol Enter agar tidak terlalu sering reload
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateSearch('q', (e.target as HTMLInputElement).value);
            }}
            placeholder="Cari Nama/NISN (Tekan Enter)..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-electric/50 transition-all"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select 
            value={rombel}
            onChange={(e) => updateSearch('rombel', e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 appearance-none focus:outline-none focus:border-electric/50 cursor-pointer"
          >
            <option value="">Semua Rombel</option>
            {rombels.sort().map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-4 px-2">
        <p className="text-xs text-slate-500 font-medium italic">
          Menampilkan halaman <span className="text-electric font-bold">{currentPage}</span> dari <span className="text-slate-300">{totalPages || 1}</span>
        </p>
        <div className="flex gap-2">
          <button 
            type="button"
            disabled={currentPage <= 1}
            onClick={() => updateSearch('page', (currentPage - 1).toString())}
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer bg-slate-900/30"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => updateSearch('page', (currentPage + 1).toString())}
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer bg-slate-900/30"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}