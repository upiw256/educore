import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-navy-dark text-slate-200">
      {/* Sidebar */}
      <aside className="w-64 bg-navy-card border-r border-slate-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-electric fill-current">
             <path d="M12 2L1 7l11 5 11-5-11-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span className="text-xl font-bold tracking-tight">Edu<span className="text-electric">Core</span></span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <a href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-electric/10 text-electric font-medium transition-all">
            Dashboard
          </a>
          <a href="/admin/students" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-all text-slate-400">
            Data Siswa
          </a>
          <div className="pt-4 pb-2 px-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
            Integrasi
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-electric/20 hover:text-electric transition-all text-slate-400 cursor-pointer">
            Sync Dapodik
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-navy-dark/50 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <div className="status-pulse">
              <span></span>
              <span></span>
            </div>
            <span className="text-xs text-success font-medium">Dapodik WS: Connected</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-sm font-medium">Admin Sekolah</p>
                <p className="text-[10px] text-slate-500 uppercase">Administrator</p>
             </div>
             <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                <img src="https://ui-avatars.com/api/?name=Admin+Sekolah&background=0B1120&color=3B82F6" alt="avatar" />
             </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}