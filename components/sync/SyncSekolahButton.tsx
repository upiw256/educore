"use client";

import { useState } from "react";
import { RefreshCw, CheckCircle2, AlertTriangle, X } from "lucide-react";

export default function SyncSekolahButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleSync = async () => {
    setIsLoading(true);
    setAlert(null); // Reset alert sebelumnya

    try {
      // Panggil API internal (X-Barrier di Backend)
      const res = await fetch("/api/sync/sekolah", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        setAlert({ 
          type: "success", 
          message: `Berhasil! Data SMAN 1 Margaasih disinkronkan.` // Sesuai data API
        });
      } else {
        throw new Error(data.error || "Gagal menghubungi server sekolah.");
      }
    } catch (error: any) {
      setAlert({ 
        type: "error", 
        message: error.message || "Sinkronisasi gagal. Coba lagi nanti." 
      });
    } finally {
      setIsLoading(false);
      // Hapus alert otomatis setelah 5 detik
      setTimeout(() => setAlert(null), 5000);
    }
  };

  return (
    <>
      {/* --- TOMBOL SYNC (DENGAN PROGRESS BAR) --- */}
      <button
        onClick={handleSync}
        disabled={isLoading}
        className="relative flex items-center gap-3 px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-orange-800 text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg overflow-hidden active:scale-95 disabled:opacity-70"
      >
        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
        {isLoading ? "Sinkronisasi..." : "Sync Data Sekolah"}
        
        {/* PROGRESS BAR LINEAR (Hanya muncul saat Loading) */}
        {isLoading && (
          <div className="absolute bottom-0 left-0 h-1 bg-white/30 w-full overflow-hidden">
            <div className="h-full bg-white animate-progress-indeterminate rounded-full" />
          </div>
        )}
      </button>

      {/* --- ALERT TOAST (NOTIFIKASI ATAS JENDELA) --- */}
      {alert && (
        <div className="fixed top-4 right-4 z-[9999] animate-fade-in-down print:hidden">
          <div className={`flex items-start gap-4 p-5 rounded-2xl border shadow-2xl w-96 ${alert.type === 'success' ? 'bg-emerald-950/90 border-emerald-500 text-emerald-100' : 'bg-red-950/90 border-red-500 text-red-100'}`}>
            
            {alert.type === 'success' ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mt-1 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-red-400 mt-1 flex-shrink-0" />
            )}
            
            <div className="flex-grow">
              <h4 className="font-black uppercase text-xs tracking-wider mb-1">
                {alert.type === 'success' ? 'Sinkronisasi Berhasil' : 'Sinkronisasi Gagal'}
              </h4>
              <p className="text-[11pt] font-mono leading-tight opacity-90 text-justify italic">
                {alert.message}
              </p>
            </div>

            <button onClick={() => setAlert(null)} className="text-white/50 hover:text-white p-1">
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* --- CSS ANIMASI (UNTUK BAR & ALERT) --- */}
      <style jsx global>{`
        @keyframes progress-indeterminate {
          0% { left: -35%; right: 100%; }
          60% { left: 100%; right: -90%; }
          100% { left: 100%; right: -90%; }
        }
        .animate-progress-indeterminate {
          position: absolute;
          animation: progress-indeterminate 1.5s infinite linear;
        }
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 0.4s ease-out forwards;
        }
      `}</style>
    </>
  );
}