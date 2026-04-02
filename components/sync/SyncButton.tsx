"use client";
import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSync = async () => {
    setIsSyncing(true);
    setProgress(5); // Mulai sedikit

    // Interval untuk menggerakkan bar secara perlahan (Fake Progress)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev; // Berhenti di 90% sampai API selesai
        return prev + 1;
      });
    }, 200); // Gerak setiap 0.2 detik

    try {
      const res = await fetch('/api/sync/siswa', { method: 'POST' });
      const result = await res.json();

      if (result.success) {
        clearInterval(interval);
        setProgress(100); // Langsung loncat ke 100%
        
        setTimeout(() => {
          alert(`Berhasil! ${result.total} data siswa sudah sinkron.`);
          window.location.reload();
        }, 500);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      clearInterval(interval);
      setProgress(0);
      alert("Gagal Sinkron: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold transition-all shadow-lg
          ${isSyncing 
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
            : 'bg-electric hover:bg-electric/80 text-white cursor-pointer active:scale-95'
          }`}
      >
        <RefreshCw className={`w-5 h-5 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? `Processing... ${progress}%` : 'Mulai Sinkronisasi'}
      </button>

      {isSyncing && (
        <div className="space-y-2 animate-in fade-in">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-electric transition-all duration-300 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>FETCHING 1.542 DATA</span>
            <span className="text-electric">{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}