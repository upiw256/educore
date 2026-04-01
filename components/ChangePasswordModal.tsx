"use client";

import React, { useState } from 'react';
import { KeyRound, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose, userId, userName, onSuccess }: ChangePasswordModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/settings/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, newPassword }),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onSuccess();
          onClose();
          setNewPassword('');
          setStatus('idle');
        }, 1500);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <KeyRound className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-lg font-bold text-white uppercase tracking-tight">Ubah Password</h3>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="mb-6 p-4 bg-slate-900/50 rounded-2xl border border-slate-800">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Target User</p>
            <p className="text-sm font-bold text-blue-400 italic">{userName}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-1">Password Baru</label>
              <input 
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                className="w-full bg-[#1e293b] border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || status === 'success'}
              className={`w-full py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] transition-all flex items-center justify-center gap-2
                ${status === 'success' ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95'}
              `}
            >
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : 
               status === 'success' ? <CheckCircle2 size={18} /> : 
               status === 'error' ? <><AlertCircle size={18} /> Gagal!</> : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}