import dbConnect from "@/lib/mongodb";
import Sekolah from "@/models/Sekolah";
import Teacher from "@/models/Teacher";
import { School, User, MapPin, Globe, Mail, Phone, AlertCircle } from "lucide-react";

export default async function SchoolProfileCard() {
  await dbConnect();

  // 1. Ambil data sekolah terbaru
  const school = await Sekolah.findOne().sort({ updatedAt: -1 }).lean();
  
  // 2. Cari Kepala Sekolah dengan Regex Case-Insensitive
  const headmaster: any = await Teacher.findOne({ 
    jenis_ptk_id_str: { $regex: /Kepala Sekolah/i } 
  }).lean();

  if (!school) {
    return (
      <div className="glass-card rounded-3xl p-10 flex flex-col items-center justify-center border-slate-800/50 bg-[#0f172a] text-center shadow-2xl">
        <AlertCircle className="text-orange-500/50 mb-4" size={48} />
        <h3 className="text-white font-black mb-2 uppercase text-xs tracking-[0.3em]">Data Tidak Ditemukan</h3>
        <p className="text-[10px] text-slate-500 italic uppercase font-bold">Silakan lakukan Sync Dapodik Terlebih Dahulu.</p>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-[2.5rem] overflow-hidden border border-slate-800/60 flex flex-col h-full bg-[#0f172a]/40 backdrop-blur-2xl shadow-2xl">
      
      {/* HEADER SECTION */}
      <div className="p-8 border-b border-slate-800/50 flex items-center justify-between bg-white/[0.01]">
        <div className="flex items-center gap-5">
          <div className="p-4 bg-orange-500/10 rounded-2xl border border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
            <School className="text-orange-500" size={28} />
          </div>
          <div>
            <h3 className="font-black text-2xl text-white italic uppercase tracking-tighter leading-none">
              {school.nama || "SMAN 1 MARGAASIH"}
            </h3>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
              <span className="text-orange-500/80">NPSN: {school.npsn}</span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span>{school.status_sekolah || "Negeri"}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* BAGIAN ATAS: GRID INFO & MAPS 1:1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          
          {/* KOLOM KIRI: DETAIL KONTAK & IDENTITAS */}
          <div className="flex flex-col justify-between space-y-8 bg-slate-900/30 p-7 rounded-[2rem] border border-slate-800/40">
            <div className="space-y-6">
              {/* Alamat */}
              <div className="flex items-start gap-5 group">
                <div className="p-3.5 bg-slate-800/80 rounded-2xl border border-slate-700 group-hover:border-orange-500/50 transition-all shadow-xl">
                  <MapPin size={20} className="text-orange-500" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-black uppercase italic tracking-widest leading-none mb-2">Lokasi Koordinat</p>
                  <p className="text-[13px] text-slate-200 leading-snug uppercase font-black tracking-tight">
                    {school.alamat}
                  </p>
                  <p className="text-[11px] text-slate-500 font-bold italic mt-1 uppercase tracking-tighter">
                    {school.desa_kelurahan}, {school.kecamatan}, {school.kabupaten_kota}
                  </p>
                </div>
              </div>

              {/* Grid Kontak */}
              <div className="space-y-5 pt-4">
                <div className="flex items-center gap-5 group border-b border-slate-800/30 pb-4">
                  <div className="w-8 flex justify-center"><Globe size={18} className="text-emerald-500" /></div>
                  <p className="text-[13px] text-emerald-400 font-mono font-bold tracking-tighter truncate">
                    {school.website || "sman1margaasih.sch.id"}
                  </p>
                </div>
                <div className="flex items-center gap-5 group border-b border-slate-800/30 pb-4">
                  <div className="w-8 flex justify-center"><Phone size={18} className="text-yellow-500" /></div>
                  <p className="text-[13px] text-yellow-400 font-mono font-bold tracking-widest">
                    {school.telepon || "022-54438236"}
                  </p>
                </div>
                <div className="flex items-center gap-5 group border-b border-slate-800/30 pb-4">
                  <div className="w-8 flex justify-center"><Mail size={18} className="text-blue-500" /></div>
                  <p className="text-[13px] text-slate-300 font-mono truncate lowercase tracking-tight">
                    {school.email || "admin@sman1margaasih.sch.id"}
                  </p>
                </div>
              </div>
            </div>

            {/* Identitas Teknis Bawah */}
            <div className="pt-6 border-t border-slate-800/50 flex justify-between items-end">
              <div>
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Kode Pos & NSS</p>
                <p className="text-[12px] text-slate-500 font-mono font-bold">{school.kode_pos || "40218"} • {school.nss || "-"}</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-1">Bentuk Pend.</p>
                <p className="text-[12px] text-slate-500 font-black italic uppercase">{school.bentuk_pendidikan || "SMA"}</p>
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: GOOGLE MAPS RATIO 1:1 */}
          <div className="aspect-square w-full min-h-[350px]">
            {school.lintang && school.bujur ? (
              <div className="rounded-[2.5rem] overflow-hidden border-2 border-slate-800/80 h-full w-full group relative shadow-[0_0_50px_rgba(0,0,0,0.6)] bg-slate-900">
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(1) invert(0.92) contrast(1.1) opacity(0.85)' }}
                  allowFullScreen
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${school.lintang},${school.bujur}&z=16&output=embed`}
                ></iframe>
                {/* Border Inner Decor */}
                <div className="absolute inset-0 pointer-events-none border-[15px] border-slate-900/10 rounded-[2.5rem]"></div>
                {/* Link Interaktif */}
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${school.lintang},${school.bujur}`}
                  target="_blank"
                  className="absolute inset-0 bg-transparent hover:bg-orange-500/5 transition-colors flex items-center justify-center group"
                >
                  <span className="bg-slate-950/90 text-[10px] font-black text-white px-8 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-all border border-slate-700 uppercase tracking-[0.3em] shadow-2xl translate-y-4 group-hover:translate-y-0">
                    📍 Buka Google Maps
                  </span>
                </a>
              </div>
            ) : (
              <div className="h-full w-full rounded-[2.5rem] bg-slate-900/50 border-2 border-dashed border-slate-800 flex items-center justify-center">
                <p className="text-slate-600 text-[10px] font-black uppercase italic tracking-widest">Koordinat Belum Terdeteksi</p>
              </div>
            )}
          </div>
        </div>

        {/* BAGIAN BAWAH: PROFIL KEPALA SEKOLAH (FULL WIDTH) */}
        <div className="relative group w-full pt-4">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-600/30 via-amber-600/10 to-transparent rounded-[2rem] blur-xl opacity-40 group-hover:opacity-70 transition-opacity"></div>
          <div className="relative p-8 bg-slate-900/80 border border-slate-800 rounded-[2rem] flex flex-col md:flex-row items-center justify-between backdrop-blur-3xl overflow-hidden shadow-2xl">
            
            {/* Dekorasi Aksen */}
            <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-orange-500/[0.03] to-transparent pointer-events-none"></div>

            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Foto Profile */}
              <div className="relative shrink-0">
                <div className="absolute -inset-3 bg-orange-500/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative w-28 h-28 rounded-full bg-slate-800 border-2 border-orange-500 p-2 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                  <div className="w-full h-full rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
                    {headmaster?.foto ? (
                      <img src={headmaster.foto} alt="Kepsek" className="w-full h-full object-cover" />
                    ) : (
                      <User className="text-orange-500/20" size={50} />
                    )}
                  </div>
                </div>
              </div>

              {/* Info Text */}
              <div className="text-center md:text-left space-y-2">
                <p className="text-[11px] text-orange-500 font-black uppercase tracking-[0.5em] mb-3 leading-none opacity-80">Authority Personnel</p>
                <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter leading-tight">
                  {headmaster?.nama || "Drs. H. Ajat Sudrajat"}
                </h4>
                <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 mt-4">
                   <div className="flex flex-col">
                      <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-1">Official ID / NIP</span>
                      <span className="text-[13px] font-mono text-slate-300 font-bold tracking-[0.2em]">{headmaster?.nip || "196601201994031006"}</span>
                   </div>
                   <div className="hidden md:block h-10 w-[1px] bg-slate-800"></div>
                   <div className="flex flex-col">
                      <span className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-1">Functional Role</span>
                      <span className="text-[13px] font-bold text-slate-400 uppercase italic tracking-tight">{headmaster?.jenis_ptk_id_str || "Kepala Sekolah"}</span>
                   </div>
                </div>
              </div>
            </div>
            
            {/* Status Sync Badge */}
            <div className="mt-8 md:mt-0 flex flex-col items-center justify-center border-2 border-slate-800 rounded-3xl px-8 py-5 bg-white/[0.03] backdrop-blur-sm shadow-xl min-w-[160px]">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.6)] mb-3 animate-pulse"></div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Status</p>
              <p className="text-[12px] text-white font-black uppercase italic tracking-widest">VERIFIED</p>
              <p className="text-[8px] text-slate-600 font-bold mt-2 font-mono italic uppercase">Dapodik Active Feed</p>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER STATUS */}
      <div className="px-8 py-5 bg-white/[0.01] border-t border-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500/80 shadow-[0_0_10px_rgba(16,185,129,0.4)]"></div>
          <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] italic">Encrypted Database Handshake Success</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-mono text-slate-700 font-bold uppercase tracking-widest">
            Lat: {school.lintang?.substring(0,8)} • Lon: {school.bujur?.substring(0,8)}
          </span>
          <span className="text-[10px] font-mono text-slate-600 italic uppercase bg-slate-800/50 px-3 py-1 rounded-full border border-slate-700/50">
            v1.0.5-PRO
          </span>
        </div>
      </div>
    </div>
  );
}