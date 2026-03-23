import React from 'react';

export default function LoginPage() {
  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-navy-dark relative overflow-hidden antialiased">
      
      {/* Background Ornaments (Efek Cahaya Biru) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-electric/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-electric/10 rounded-full blur-[100px]" />
      </div>

      {/* Card Login EduCore (Menggunakan Utility glass-card dari v4) */}
      <div className="relative z-10 w-full max-w-[420px] p-8 mx-4 glass-card rounded-3xl animate-in fade-in zoom-in duration-500">
        
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2 mb-1">
            {/* Logo Icon: Representasi Shield/Core */}
            <svg 
              viewBox="0 0 24 24" 
              className="w-10 h-10 text-electric fill-current" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 2L1 7l11 5 11-5-11-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Edu<span className="text-electric">Core</span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm font-medium">Admin Portal | Please Sign In</p>
        </div>

        {/* Form Section */}
        <form className="space-y-5">
          {/* Input Username */}
          <div className="space-y-2">
            <label className="block text-slate-300 text-sm font-medium pl-1">
              Username
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-electric transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </span>
              <input 
                type="text" 
                placeholder="admin_sekolah" 
                className="w-full bg-navy-input border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all duration-300"
              />
            </div>
          </div>

          {/* Input Password */}
          <div className="space-y-2">
            <label className="block text-slate-300 text-sm font-medium pl-1">
              Password
            </label>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 group-focus-within:text-electric transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </span>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full bg-navy-input border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric transition-all duration-300"
              />
            </div>
          </div>

          {/* Login Button */}
          <button 
            type="submit"
            className="w-full bg-electric hover:bg-electric-hover text-white font-bold py-3.5 rounded-xl shadow-lg shadow-electric/20 transform active:scale-[0.98] transition-all duration-200 mt-2 uppercase tracking-wider text-sm cursor-pointer"
          >
            Login Now
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center">
          <a href="#" className="text-electric/70 hover:text-electric text-sm transition-colors font-medium">
            Forgot Password?
          </a>
        </div>
      </div>
    </main>
  );
}