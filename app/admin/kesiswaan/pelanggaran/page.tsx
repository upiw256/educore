"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { 
  Search, Plus, X, Loader2, ShieldAlert, Eye, Printer, User
} from "lucide-react";

// --- INTERFACES ---
interface PelanggaranLog {
  _id: string;
  nis: string;
  name: string;
  className: string;
  type: string;
  poin: number;
  description: string;
  date: string;
}

interface PelanggaranSummary {
  nis: string;
  name: string;
  className: string;
  totalPoin: number;
}

export default function PelanggaranPage() {
  // --- STATES ---
  const [summaries, setSummaries] = useState<PelanggaranSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [isMasterLoading, setIsMasterLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [masterSearch, setMasterSearch] = useState("");
  const [selection, setSelection] = useState<any>(null);
  const [violationType, setViolationType] = useState(""); 
  const [poin, setPoin] = useState(0); 
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedStudentSummary, setSelectedStudentSummary] = useState<PelanggaranSummary | null>(null);
  const [studentLogs, setStudentLogs] = useState<PelanggaranLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  // --- LOGIC DATA ---
  const fetchMasterSiswa = useCallback(async () => {
    setIsMasterLoading(true);
    try {
      const res = await fetch(`/api/sync/siswa`);
      const data = await res.json();
      setAllStudents(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setIsMasterLoading(false); }
  }, []);

  useEffect(() => { fetchMasterSiswa(); }, [fetchMasterSiswa]);

  const fetchData = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/kesiswaan/pelanggaran?summary=true&search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSummaries(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchData(searchQuery), 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchData]);

  const getStudentInfo = (nis: string) => {
    const found = allStudents.find(s => String(s.nipd) === String(nis));
    return { nama: found?.nama || "", kelas: found?.nama_rombel || "" };
  };

  const filteredMaster = useMemo(() => {
    const sLow = (masterSearch || "").toLowerCase().trim();
    if (!sLow) return allStudents;
    return allStudents.filter((s) => {
      const nama = s?.nama ? String(s.nama).toLowerCase() : "";
      const nipd = s?.nipd ? String(s.nipd).toLowerCase() : "";
      return nama.includes(sLow) || nipd.includes(sLow);
    });
  }, [masterSearch, allStudents]);

  // --- HANDLERS ---
  const handleCategoryChange = (val: string) => {
    setViolationType(val);
    if (val === "Ringan") setPoin(10);
    else if (val === "Menengah") setPoin(50);
    else if (val === "Berat") setPoin(100);
    else setPoin(0);
  };

  const handleSubmit = async () => {
    if (!selection || !violationType || poin <= 0) return;
    setSubmitting(true);
    try {
      const payload = {
        nis: selection.nipd, 
        name: selection.nama, 
        className: selection.nama_rombel || "Tanpa Kelas",
        type: violationType, poin: poin, 
        description: description || "Pelanggaran tata tertib", 
        date: new Date().toISOString()
      };
      const res = await fetch('/api/kesiswaan/pelanggaran', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setIsModalOpen(false); setSelection(null); setViolationType(""); 
        setPoin(0); setDescription(""); setMasterSearch(""); fetchData(""); 
      }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const handleOpenDetail = async (student: PelanggaranSummary) => {
    setSelectedStudentSummary(student);
    setIsDetailOpen(true);
    setIsLogsLoading(true);
    try {
      const res = await fetch(`/api/kesiswaan/pelanggaran?nis=${student.nis}`);
      const data = await res.json();
      setStudentLogs(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setIsLogsLoading(false); }
  };

  const handlePrintSurat = (student: PelanggaranSummary, logs: PelanggaranLog[]) => {
    const info = getStudentInfo(student.nis);
    setPrintData({
      name: info.nama || student.name,
      nis: student.nis,
      className: info.kelas || student.className,
      totalPoin: student.totalPoin,
      pernyataan: logs.map(l => `- ${l.type}: ${l.description} (${new Date(l.date).toLocaleDateString('id-ID')})`).join('\n'),
      tgl: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    });
    setTimeout(() => { window.print(); setTimeout(() => setPrintData(null), 1000); }, 1200);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#020617] text-slate-200">
      
      {/* HEADER & SEARCH UTAMA */}
      <div className="print:hidden flex flex-col md:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-black flex items-center gap-3 uppercase italic tracking-tighter">
          <div className="p-2 bg-orange-500/10 rounded-lg"><ShieldAlert className="text-orange-500" /></div>
          Pelanggaran Siswa
        </h1>
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input type="text" placeholder="Cari Siswa..." className="pl-10 pr-4 py-3 bg-[#0f172a] border border-slate-800 rounded-xl text-sm outline-none w-full md:w-64 focus:ring-2 focus:ring-orange-500 font-bold" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg active:scale-95 text-xs uppercase"><Plus size={18} /> Catat Baru</button>
        </div>
      </div>

      {/* TABEL REKAP */}
      <div className="print:hidden bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/30 text-[10px] uppercase text-slate-500 font-black border-b border-slate-800 tracking-widest">
            <tr>
              <th className="px-6 py-5">SISWA</th>
              <th className="px-6 py-5 text-center">POIN</th>
              <th className="px-6 py-5 text-center">STATUS</th>
              <th className="px-6 py-5 text-right">AKSI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {loading ? (
              <tr><td colSpan={4} className="py-20 text-center"><Loader2 className="mx-auto animate-spin text-orange-500" /></td></tr>
            ) : summaries.map((s) => {
              const info = getStudentInfo(s.nis);
              return (
                <tr key={s.nis} className="hover:bg-orange-600/5 group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm uppercase group-hover:text-orange-400">{info.nama || s.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono font-bold">{info.kelas || s.className} • {s.nis}</div>
                  </td>
                  <td className="px-6 py-4 text-center font-black text-lg text-orange-400">{s.totalPoin}</td>
                  <td className="px-6 py-4 text-center">
                    <div className={`text-[10px] font-black px-4 py-1 rounded-full inline-block ${s.totalPoin >= 100 ? 'bg-red-500/20 text-red-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{s.totalPoin >= 100 ? 'PEMBINAAN' : 'NORMAL'}</div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleOpenDetail(s)} className="p-2.5 bg-slate-800 hover:bg-orange-600 text-slate-400 hover:text-white rounded-xl transition-all"><Eye size={16} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL (WAJIB ADA BIAR ACTION BERFUNGSI) */}
      {isDetailOpen && selectedStudentSummary && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md print:hidden">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-800 rounded-xl text-slate-400"><User size={20}/></div>
                <div>
                  <h2 className="text-xl font-black text-white uppercase">{getStudentInfo(selectedStudentSummary.nis).nama || selectedStudentSummary.name}</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase">{getStudentInfo(selectedStudentSummary.nis).kelas || selectedStudentSummary.className}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => handlePrintSurat(selectedStudentSummary, studentLogs)} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 uppercase transition-all tracking-widest"><Printer size={16}/> Cetak SP</button>
                <button onClick={() => setIsDetailOpen(false)} className="p-2 text-slate-500 hover:text-white"><X size={24}/></button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
              {isLogsLoading ? <Loader2 className="animate-spin mx-auto py-10" /> : studentLogs.map((log) => (
                <div key={log._id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                  <div>
                    <p className="text-xs font-black text-orange-500 uppercase">{log.type} ({log.poin} Poin)</p>
                    <p className="text-[11px] text-slate-400 italic">"{log.description}"</p>
                  </div>
                  <div className="text-[10px] font-mono text-slate-600">{new Date(log.date).toLocaleDateString('id-ID')}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT (CATAT BARU) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md print:hidden">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20 text-white font-black uppercase tracking-tighter">
              Input Pelanggaran Baru
              <button onClick={() => setIsModalOpen(false)}><X size={24}/></button>
            </div>
            <div className="flex flex-col md:flex-row overflow-hidden h-full">
              <div className="flex-1 p-6 border-r border-slate-800 flex flex-col gap-4">
                <input autoFocus className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-orange-500 font-bold uppercase" placeholder="Cari Nama/NIS..." value={masterSearch} onChange={(e) => setMasterSearch(e.target.value)} />
                <div className="flex-1 bg-slate-950/50 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                  {isMasterLoading ? <Loader2 className="animate-spin mx-auto py-10" /> : filteredMaster.map((m, i) => (
                    <div key={i} className={`p-4 border-b border-slate-800 flex justify-between items-center hover:bg-orange-500/5 ${selection?.nipd === m.nipd ? 'bg-orange-600/10' : ''}`}>
                      <div><p className="text-xs font-black text-slate-200 uppercase">{m.nama}</p><p className="text-[9px] text-slate-500 font-bold uppercase">{m.nama_rombel}</p></div>
                      <button onClick={() => setSelection(m)} className={`px-4 py-2 rounded-lg text-[10px] font-black ${selection?.nipd === m.nipd ? 'bg-orange-600 text-white' : 'bg-slate-800 text-slate-500'}`}>{selection?.nipd === m.nipd ? 'DIPILIH' : 'PILIH'}</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full md:w-80 p-6 bg-slate-800/10 flex flex-col gap-6">
                <select value={violationType} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white text-sm font-black outline-none">
                  <option value="">Kategori...</option>
                  <option value="Ringan">Ringan (10 Poin)</option>
                  <option value="Menengah">Menengah (50 Poin)</option>
                  <option value="Berat">Berat (100 Poin)</option>
                </select>
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-orange-500 font-black text-2xl text-center">{poin}</div>
                <textarea rows={4} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white text-sm outline-none focus:ring-1 focus:ring-orange-500" placeholder="Deskripsi..." value={description} onChange={(e) => setDescription(e.target.value)} />
                <button disabled={!selection || !violationType || submitting} onClick={handleSubmit} className="w-full py-4 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest">{submitting ? <Loader2 className="animate-spin mx-auto" /> : "SIMPAN DATA"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- AREA PRINT (SINGLE PAGE & ANTI-MUTER) --- */}
      {printData && (
        <div id="print-area" className="hidden print:block bg-white text-black font-serif shadow-none border-none overflow-hidden">
          <div className="w-[210mm] h-[297mm] mx-auto p-[1.5cm_2cm] box-border relative flex flex-col bg-white">
            
            {/* Kop Surat */}
            <div className="text-center border-b-4 border-double border-black pb-2 mb-8">
              <h1 className="text-[14pt] font-black leading-tight m-0 uppercase italic">Pemerintah Provinsi Jawa Barat</h1>
              <h1 className="text-[12pt] font-bold leading-tight m-0 uppercase italic">Dinas Pendidikan</h1>
              <h1 className="text-[18pt] font-extrabold mt-1 m-0 uppercase italic">SMAN 1 MARGAASIH</h1>
              <p className="text-[8pt] italic m-0">Jl. Terusan Cipatik, Kec. Margaasih, Kabupaten Bandung, Jawa Barat</p>
            </div>

            {/* Nomor & Perihal */}
            <div className="flex justify-between mb-8 text-[11pt]">
              <div>
                <p>Nomor : 421.3 / SP / {new Date().getFullYear()}</p>
                <p>Hal : <span className="font-bold underline italic text-black">Surat Peringatan Siswa</span></p>
              </div>
              <p>Bandung, {printData.tgl}</p>
            </div>

            {/* Tujuan */}
            <div className="mb-6 text-[11pt]">
              <p>Kepada Yth. Orang Tua / Wali Siswa Dari:</p>
              <div className="ml-4 font-bold uppercase underline mt-1 text-[12pt]">
                {printData.name} (Kelas {printData.className})
              </div>
            </div>

            {/* Isi Surat */}
            <div className="text-justify text-[11pt] space-y-5 leading-relaxed italic flex-1">
              <p>Dengan hormat, melalui surat ini kami sampaikan laporan kedisiplinan putra/putri Bapak/Ibu. Berdasarkan catatan sekolah, siswa tersebut telah melakukan tindakan:</p>
              
              <div className="p-4 bg-gray-50 border border-gray-300 font-mono text-[10pt] whitespace-pre-wrap leading-normal">
                {printData.pernyataan}
              </div>

              <p>Akumulasi poin saat ini adalah <span className="font-bold underline text-[13pt]">{printData.totalPoin} Poin</span>. Kami mengharapkan kerja sama Bapak/Ibu untuk memberikan pembinaan di rumah demi kebaikan siswa.</p>
              
              <p>Demikian surat ini kami sampaikan. Atas perhatiannya diucapkan terima kasih.</p>
            </div>

            {/* Tanda Tangan (mt-auto menjaga tetap di bawah halaman 1) */}
            <div className="grid grid-cols-2 text-center mt-auto mb-10 text-[11pt]">
              <div className="flex flex-col items-center">
                <p className="mb-24 italic">Orang Tua / Wali,</p>
                <div className="w-44 border-t border-black pt-1">( ........................... )</div>
              </div>
              <div className="flex flex-col items-center">
                <p className="italic">Kepala Sekolah,</p>
                <div className="h-24"></div>
                <div className="w-60 border-t border-black pt-1 font-bold underline">Drs. H. AJAT SUDRAJAT</div>
                <p className="text-[10pt]">NIP. 196601201994031006</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- CSS FIX: SINGLE PAGE & STABLE UI --- */}
      <style jsx global>{`
        @media print {
          /* Sembunyikan SEMUA elemen UI Admin */
          .print\:hidden { 
            display: none !important; 
          }
          
          /* Paksa body bersih */
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Tampilkan area print saja */
          #print-area {
            display: block !important;
            visibility: visible !important;
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            height: 297mm !important;
            z-index: 9999 !important;
          }

          @page {
            size: A4 portrait;
            margin: 0 !important;
          }
        }

        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}