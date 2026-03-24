"use client";

import { Search, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  query: string;
  currentPage: number;
  totalPages: number;
}

export default function GuruTableControls({ query, currentPage, totalPages }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateSearch = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    
    // Reset ke halaman 1 jika melakukan pencarian baru
    if (name !== 'page') params.set('page', '1');
    
    router.push(`/admin/guru?${params.toString()}`);
    router.refresh();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            defaultValue={query}
            onKeyDown={(e) => {
              if (e.key === 'Enter') updateSearch('q', (e.target as HTMLInputElement).value);
            }}
            placeholder="Cari Nama, NIP, atau NUPTK (Enter)..."
            className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-electric/50 transition-all placeholder:text-slate-600"
          />
        </div>
      </div>

      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-slate-500 font-medium italic">
          Menampilkan halaman <span className="text-electric font-bold">{currentPage}</span> dari <span className="text-slate-300">{totalPages || 1}</span>
        </p>
        <div className="flex gap-2">
          <button 
            disabled={currentPage <= 1}
            onClick={() => updateSearch('page', (currentPage - 1).toString())}
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer bg-slate-900/30"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            disabled={currentPage >= totalPages}
            onClick={() => updateSearch('page', (currentPage + 1).toString())}
            className="p-2 rounded-lg border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-all cursor-pointer bg-slate-900/30"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}