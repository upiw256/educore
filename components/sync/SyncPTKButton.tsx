"use client";
import React, { useState } from 'react';
import { Users } from 'lucide-react';

export default function SyncPTKButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSync = async () => {
    setIsSyncing(true);
    setProgress(5);

    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 2));
    }, 150);

    try {
      const res = await fetch('/api/sync/ptk', { method: 'POST' });
      const result = await res.json();

      if (result.success) {
        clearInterval(interval);
        setProgress(100);
        setTimeout(() => {
          alert(`Berhasil! ${result.total} data PTK/Guru telah diperbarui.`);
          window.location.reload();
        }, 500);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      clearInterval(interval);
      setProgress(0);
      alert("Gagal Sinkron PTK: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl font-bold transition-all border
          ${isSyncing 
            ? 'bg-slate-800 text-slate-500 border-slate-700' 
            : 'bg-slate-800/40 hover:bg-slate-700/60 text-white border-slate-700 cursor-pointer active:scale-95'
          }`}
      >
        <Users className={`w-5 h-5 ${isSyncing ? 'animate-bounce' : ''}`} />
        {isSyncing ? `Syncing PTK... ${progress}%` : 'Sync Data Guru (PTK)'}
      </button>

      {isSyncing && (
        <div className="space-y-2 animate-in fade-in">
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500">
            <span>FETCHING PTK DATA</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}
    </div>
  );
}