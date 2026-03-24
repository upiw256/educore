"use client";

import React, { useEffect, useState } from 'react';

export default function DapodikStatus() {
  const [status, setStatus] = useState<'loading' | 'online' | 'offline'>('loading');

  const checkConnection = async () => {
  try {
    const res = await fetch('/api/health/dapodik');
    const data = await res.json();
    
    // Debug: Cek di console browser apakah nilainya true atau false
    console.log("Status Dapodik:", data); 

    if (data.connected === true) {
      setStatus('online');
    } else {
      setStatus('offline');
    }
  } catch (err) {
    setStatus('offline');
  }
};

  useEffect(() => {
    checkConnection();
    // Cek setiap 30 detik
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/50 border border-slate-800">
      <div className="relative flex h-2 w-2">
        {status === 'online' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${
          status === 'loading' ? 'bg-slate-600' : 
          status === 'online' ? 'bg-emerald-500' : 'bg-rose-500'
        }`}></span>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-wider ${
        status === 'loading' ? 'text-slate-500' : 
        status === 'online' ? 'text-emerald-400' : 'text-rose-400'
      }`}>
        API Dapodik: {status === 'loading' ? 'Checking...' : status === 'online' ? 'Connected' : 'Disconnected'}
      </span>
    </div>
  );
}