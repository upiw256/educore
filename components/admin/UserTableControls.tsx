'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';

// Props harus fokus ke pencarian dan halaman, bukan data guru
interface Props {
  query: string;
  currentPage: number;
  totalPages: number;
}

export default function UserTableControls({ query, currentPage, totalPages }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(query);

  const updateSearch = (term: string, page: number = 1) => {
    const params = new URLSearchParams(searchParams.toString());
    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm !== query) {
        updateSearch(searchTerm);
      }
    }, 600);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, query]);

  const clearSearch = () => {
    setSearchTerm("");
    updateSearch("");
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/40 p-4 rounded-2xl border border-slate-800/50 backdrop-blur-md shadow-lg">
      <div className="relative w-full md:w-96 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Cari Nama atau NIP Guru..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#0b1120] border border-slate-800 rounded-xl py-3 pl-12 pr-10 text-sm text-white focus:outline-none focus:border-orange-500/50 shadow-inner"
        />
        {searchTerm && (
          <button onClick={clearSearch} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white">
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {query && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <Filter size={12} className="text-orange-500" />
            <span className="text-[9px] font-black text-orange-500 uppercase tracking-widest">Filtering Active</span>
          </div>
        )}

        <div className="flex items-center gap-1 bg-[#0b1120] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => updateSearch(searchTerm, Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="p-2 text-slate-500 hover:text-orange-500 disabled:opacity-20"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 text-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Halaman</p>
            <p className="text-xs font-mono font-bold text-white">{currentPage} / {totalPages || 1}</p>
          </div>
          <button
            onClick={() => updateSearch(searchTerm, Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="p-2 text-slate-500 hover:text-orange-500 disabled:opacity-20"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}