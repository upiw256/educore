'use client';

import React, { useState, useEffect } from 'react';
import { 
  User as UserIcon, 
  Fingerprint, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  Briefcase, 
  Loader2,
  IdCard,
  KeyRound,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// --- DEFINISI TIPE DATA (TypeScript) ---
interface TeacherData {
  nama: string;
  nip?: string;
  nuptk?: string;
  tempat_lahir?: string;
  tanggal_lahir?: string;
  jenis_ptk_id_str?: string;
  jabatan_ptk_id_str?: string;
  status_kepegawaian_id_str?: string;
}

interface BadgeProps {
  icon: React.ReactNode;
  label: string;
  value?: string;
  color: 'blue' | 'purple';
}

interface InfoItemProps {
  label: string;
  value?: string;
  icon: React.ReactNode;
}

interface InputGroupProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}

// --- KOMPONEN UTAMA ---
export default function ProfilePage() {
  // State untuk Data Profile
  const [data, setData] = useState<TeacherData | null>(null);
  const [loading, setLoading] = useState(true);

  // State untuk Form Password
  const [pwd, setPwd] = useState({ old: '', new: '', confirm: '' });
  const [isUpdating, setIsUpdating] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // 1. Ambil Data Profile dari API saat halaman dimuat
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('/api/users/profile');
        const json = await res.json();
        if (!json.error) {
          setData(json);
        }
      } catch (err) {
        console.error("Gagal mengambil data profil");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // 2. Fungsi untuk Update Password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    if (pwd.new !== pwd.confirm) {
      return setMsg({ type: 'error', text: 'Konfirmasi password tidak cocok!' });
    }
    
    setIsUpdating(true);
    try {
      const res = await fetch('/api/users/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          oldPassword: pwd.old, 
          newPassword: pwd.new 
        }),
      });
      const result = await res.json();
      
      if (res.ok) {
        setMsg({ type: 'success', text: 'Password berhasil diperbarui!' });
        setPwd({ old: '', new: '', confirm: '' });
      } else {
        setMsg({ type: 'error', text: result.error || 'Gagal memperbarui password' });
      }
    } catch (err) {
      setMsg({ type: 'error', text: 'Terjadi kesalahan sistem' });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return (
    <div className="h-[60vh] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700 pb-20">
      
      {/* --- HEADER PROFILE CARD --- */}
      <div className="p-8 rounded-3xl bg-[#0f172a]/60 border border-white/5 backdrop-blur-xl flex flex-col md:flex-row items-center gap-8">
        <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-1 shadow-2xl shadow-blue-500/20">
          <div className="w-full h-full rounded-[22px] bg-[#0b1120] flex items-center justify-center overflow-hidden">
             <img 
               src={`https://ui-avatars.com/api/?name=${data?.nama || 'User'}&background=0B1120&color=3B82F6&size=128`} 
               alt="Avatar" 
             />
          </div>
        </div>
        
        <div className="text-center md:text-left flex-1">
          <h1 className="text-2xl font-black text-white uppercase tracking-tight italic">
            {data?.nama || 'Nama Guru'}
          </h1>
          <p className="text-blue-400 font-bold text-[10px] uppercase tracking-[0.4em] mt-1">
            {data?.jabatan_ptk_id_str || 'Tenaga Pendidik SMAN 1 Margaasih'}
          </p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-5">
             <Badge icon={<Fingerprint size={12}/>} label="NIP" value={data?.nip} color="blue" />
             <Badge icon={<IdCard size={12}/>} label="NUPTK" value={data?.nuptk} color="purple" />
          </div>
        </div>
      </div>

      {/* --- INFO DETAIL GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#0f172a]/40 border border-white/5 space-y-6">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-2">
             <UserIcon size={14} /> Informasi Kelahiran
           </h3>
           <div className="space-y-4">
             <InfoItem label="Tempat Lahir" value={data?.tempat_lahir} icon={<MapPin size={16}/>} />
             <InfoItem label="Tanggal Lahir" value={data?.tanggal_lahir} icon={<Calendar size={16}/>} />
           </div>
        </div>

        <div className="p-6 rounded-3xl bg-[#0f172a]/40 border border-white/5 space-y-6">
           <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-3 flex items-center gap-2">
             <Briefcase size={14} /> Status Kepegawaian
           </h3>
           <div className="space-y-4">
             <InfoItem label="Jenis PTK" value={data?.jenis_ptk_id_str} icon={<ShieldCheck size={16}/>} />
             <InfoItem label="Status Pegawai" value={data?.status_kepegawaian_id_str} icon={<Briefcase size={16}/>} />
           </div>
        </div>
      </div>

      {/* --- FORM GANTI PASSWORD --- */}
      <div className="p-8 rounded-3xl bg-[#0f172a]/40 border border-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-orange-500/10 rounded-lg">
            <KeyRound size={18} className="text-orange-500" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Keamanan Akun</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InputGroup 
            label="Password Lama" 
            value={pwd.old} 
            onChange={(val) => setPwd({...pwd, old: val})} 
            placeholder="••••••••"
          />
          <InputGroup 
            label="Password Baru" 
            value={pwd.new} 
            onChange={(val) => setPwd({...pwd, new: val})} 
            placeholder="Min. 6 Karakter"
          />
          <InputGroup 
            label="Ulangi Password" 
            value={pwd.confirm} 
            onChange={(val) => setPwd({...pwd, confirm: val})} 
            placeholder="••••••••"
          />

          <div className="md:col-span-3 flex flex-col md:flex-row items-center justify-between gap-4 mt-4 p-4 rounded-2xl bg-slate-900/30 border border-slate-800/50">
            <div className="flex items-center gap-2">
              {msg.text && (
                <>
                  {msg.type === 'success' ? <CheckCircle2 className="text-green-500" size={16} /> : <AlertCircle className="text-red-500" size={16} />}
                  <p className={`text-[11px] font-bold uppercase tracking-tight ${msg.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                    {msg.text}
                  </p>
                </>
              )}
            </div>
            <button 
              disabled={isUpdating}
              className="w-full md:w-auto px-10 py-3.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-900/20 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              {isUpdating ? <Loader2 size={14} className="animate-spin" /> : 'Simpan Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- SUB-KOMPONEN DENGAN TYPE SAFETY ---
function Badge({ icon, label, value, color }: BadgeProps) {
  const colors = {
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-400",
    purple: "bg-purple-500/10 border-purple-500/20 text-purple-400"
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[10px] font-bold ${colors[color]}`}>
      {icon} {label}: <span className="text-white">{value || '-'}</span>
    </div>
  );
}

function InfoItem({ label, value, icon }: InfoItemProps) {
  return (
    <div className="flex items-start gap-4 group cursor-default">
      <div className="mt-1 text-slate-600 group-hover:text-blue-500 transition-colors duration-300">
        {icon}
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold text-slate-200 mt-0.5">{value || 'Belum diatur'}</p>
      </div>
    </div>
  );
}

function InputGroup({ label, value, onChange, placeholder }: InputGroupProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest pl-1">{label}</label>
      <input 
        type="password" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#1e293b]/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500/50 focus:bg-slate-900/80 outline-none transition-all placeholder:text-slate-700"
        placeholder={placeholder}
        required
      />
    </div>
  );
}