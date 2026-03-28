'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Mengirim request ke API yang nantinya akan diverifikasi oleh proxy.ts
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // Logika pengalihan rute berdasarkan role dari database
        router.push('/admin/dashboard');
        
        // Memastikan proxy menyadari perubahan session
        router.refresh(); 
      } else {
        setErrorMessage(data.message || 'Kredensial tidak valid');
      }
    } catch (err) {
      setErrorMessage('Terjadi gangguan koneksi ke server EduCore');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-navy-dark relative overflow-hidden antialiased text-slate-200">
      {/* Efek Cahaya Latar Belakang */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-electric/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px] p-8 mx-4 glass-card rounded-3xl animate-in fade-in zoom-in duration-500 shadow-2xl border border-white/5 bg-[#0f172a]/60 backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-black tracking-tighter text-white italic uppercase">
            Edu<span className="text-electric">Core</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.3em] mt-2 italic">
            Portal Otoritas SMAN 1 Margaasih
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest pl-1">Identitas User</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="NIP atau Username" 
              className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl py-3.5 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/30 focus:border-electric transition-all duration-300 text-sm font-medium shadow-inner"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-slate-400 text-[10px] font-black uppercase tracking-widest pl-1">Kata Sandi</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" 
              className="w-full bg-[#1e293b]/50 border border-slate-700/50 rounded-2xl py-3.5 px-5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/30 focus:border-electric transition-all duration-300 text-sm font-medium shadow-inner"
              required
            />
          </div>

          {/* Feedback Visual Error di atas tombol */}
          {errorMessage && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-[10px] text-red-500 font-black uppercase tracking-widest leading-relaxed">
                {errorMessage}
              </p>
            </div>
          )}

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-electric hover:bg-electric-hover text-white font-black py-4 rounded-2xl shadow-xl shadow-electric/20 transform active:scale-[0.97] transition-all flex items-center justify-center gap-3 uppercase text-[10px] tracking-[0.2em] disabled:opacity-40 disabled:cursor-not-allowed border border-white/10"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              'Autentikasi Sekarang'
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
          <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">
            Dikembangkan oleh IT Support Margaasih
          </p>
        </div>
      </div>
    </main>
  );
}