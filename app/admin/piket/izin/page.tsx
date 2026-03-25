"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  Search, Plus, X, Loader2, FileText, Eye, Check, Calendar, Printer 
} from "lucide-react";

interface IzinSummary {
  nis: string;
  name: string;
  className: string;
  countMasuk: number;
  countKeluar: number;
}

export default function StudentPermitPage() {
  const [summaries, setSummaries] = useState<IzinSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  
  // Modal Buat Izin
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [masterSearch, setMasterSearch] = useState("");
  const [masterResults, setMasterResults] = useState<any[]>([]);
  const [isMasterLoading, setIsMasterLoading] = useState(false);
  const [selection, setSelection] = useState<any>(null);
  const [permitType, setPermitType] = useState<"KELUAR" | "MASUK">("KELUAR");
  const [reason, setReason] = useState(""); 
  const [submitting, setSubmitting] = useState(false);
  
  // Modal Detail & Print
  const [detailData, setDetailData] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<IzinSummary | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [printData, setPrintData] = useState<any>(null);

  // 1. FETCH REKAP UTAMA
  const fetchData = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sync/siswa/izin?summary=true&search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSummaries(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { fetchData(searchQuery); }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchData]);

  // 2. FETCH DETAIL RIWAYAT
  const fetchDetail = async (student: IzinSummary) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
    setDetailData([]);
    try {
      const res = await fetch(`/api/sync/siswa/izin?nis=${student.nis}&summary=false`);
      const data = await res.json();
      setDetailData(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
  };

  // 3. PENCARIAN MASTER SISWA
  useEffect(() => {
    const fetchMaster = async () => {
      if (masterSearch.trim().length >= 4) {
        setIsMasterLoading(true);
        try {
          const res = await fetch(`/api/sync/siswa?search=${encodeURIComponent(masterSearch)}`);
          const data = await res.json();
          setMasterResults(Array.isArray(data) ? data : []);
        } catch (e) { console.error(e); } finally { setIsMasterLoading(false); }
      } else { setMasterResults([]); }
    };
    const timer = setTimeout(fetchMaster, 400);
    return () => clearTimeout(timer);
  }, [masterSearch]);

  // 4. SIMPAN DATA & CETAK
  const handleSubmit = async () => {
    if (!selection || !reason.trim()) return;
    setSubmitting(true);
    const payload = {
      nipd: selection.nipd,
      name: selection.nama,
      className: selection.nama_rombel,
      type: permitType,
      reason: reason.trim(),
      time: new Date().toISOString()
    };
    try {
      const res = await fetch('/api/sync/siswa/izin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setPrintData(payload);
        setTimeout(() => {
          window.print();
          setIsModalOpen(false);
          setSelection(null);
          setReason("");
          setMasterSearch("");
          fetchData(""); 
        }, 500);
      }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const handleReprint = (data: any) => {
    setPrintData({
      nipd: selectedStudent?.nis,
      name: selectedStudent?.name,
      className: selectedStudent?.className,
      type: data.type,
      reason: data.reason,
      time: data.time
    });
    setTimeout(() => { window.print(); }, 300);
  };

  return (
    <div className="p-8 space-y-8 min-h-screen bg-[#020617] text-slate-200">
      {/* HEADER */}
      <div className="flex justify-between items-center print:hidden">
        <h1 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg"><FileText className="text-emerald-500" /></div>
          Manajemen Izin
        </h1>
        <div className="flex gap-4">
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg">
            <Plus size={18} /> Buat Izin
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" placeholder="Cari rekap..."
              className="pl-10 pr-4 py-3 bg-[#0f172a] border border-slate-800 rounded-xl text-sm outline-none w-64 focus:ring-2 focus:ring-emerald-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TABEL REKAP */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden print:hidden shadow-2xl">
        <table className="w-full text-left">
          <thead className="bg-slate-800/30 text-[10px] uppercase text-slate-500 font-black border-b border-slate-800 tracking-widest">
            <tr>
              <th className="px-6 py-5">Siswa</th>
              <th className="px-6 py-5 text-center">Masuk</th>
              <th className="px-6 py-5 text-center">Keluar</th>
              <th className="px-6 py-5 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {summaries.length === 0 ? (
              <tr><td colSpan={4} className="py-20 text-center text-slate-600 text-[10px] font-bold uppercase italic tracking-widest">Data Kosong</td></tr>
            ) : (
              summaries.map((s) => (
                <tr key={s.nis} className="hover:bg-emerald-600/5 group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm uppercase group-hover:text-emerald-400">{s.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono tracking-tighter uppercase">{s.className} • {s.nis}</div>
                  </td>
                  <td className="px-6 py-4 text-center text-blue-400 font-black text-lg">{s.countMasuk}</td>
                  <td className="px-6 py-4 text-center text-red-400 font-black text-lg">{s.countKeluar}</td>
                  <td className="px-6 py-4 text-right">
                     <button onClick={() => fetchDetail(s)} className="p-2.5 bg-slate-800 hover:bg-emerald-600 text-slate-400 hover:text-white rounded-xl transition-all"><Eye size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL DETAIL */}
      {isDetailOpen && selectedStudent && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <div>
                <h2 className="text-lg font-bold text-white uppercase">{selectedStudent.name}</h2>
                <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{selectedStudent.className}</p>
              </div>
              <button onClick={() => setIsDetailOpen(false)} className="p-2 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-full"><X size={24}/></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-3 custom-scrollbar">
              {detailData.length === 0 ? (
                <div className="py-10 text-center"><Loader2 className="mx-auto animate-spin text-emerald-500" /></div>
              ) : (
                detailData.map((d, i) => (
                  <div key={i} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${d.type === 'KELUAR' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-500'}`}><Calendar size={18} /></div>
                      <div>
                        <p className="text-xs font-black text-slate-200 uppercase">"{d.reason}"</p>
                        <p className="text-[9px] text-slate-500 font-bold">{new Date(d.time).toLocaleString('id-ID')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`text-[10px] font-black px-4 py-1.5 rounded-full ${d.type === 'KELUAR' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>{d.type}</div>
                      <button onClick={() => handleReprint(d)} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-lg"><Printer size={15} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL BUAT IZIN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
              <h2 className="text-xl font-bold text-white">Input Izin Baru</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24}/></button>
            </div>
            <div className="flex flex-col md:flex-row h-full overflow-hidden">
              <div className="flex-1 p-6 border-r border-slate-800 flex flex-col space-y-4 overflow-hidden">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <input autoFocus className="w-full bg-slate-900 border border-slate-800 pl-12 pr-4 py-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm" placeholder="Ketik Nama Siswa (Min. 4 Huruf)..." value={masterSearch} onChange={(e) => setMasterSearch(e.target.value)} />
                  {isMasterLoading && <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-emerald-500 w-4 h-4" />}
                </div>
                <div className="flex-1 bg-slate-950/50 rounded-2xl border border-slate-800 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-800/50">
                      {masterResults.filter(m => m.nama.toLowerCase().includes(masterSearch.toLowerCase())).length === 0 ? (
                        <tr><td className="py-20 text-center text-slate-700 text-[10px] font-bold uppercase italic">Ketik minimal 4 huruf...</td></tr>
                      ) : (
                        masterResults.filter(m => m.nama.toLowerCase().includes(masterSearch.toLowerCase())).map((m, i) => (
                          <tr key={i} className={`hover:bg-emerald-500/5 ${selection?.nipd === m.nipd ? 'bg-emerald-600/10' : ''}`}>
                            <td className="px-5 py-4">
                              <p className="text-xs font-bold text-slate-200 uppercase">{m.nama}</p>
                              <p className="text-[9px] text-slate-500 font-bold uppercase">{m.nama_rombel}</p>
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button onClick={() => setSelection(m)} className={`px-5 py-2 rounded-xl text-[10px] font-black ${selection?.nipd === m.nipd ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-500'}`}>PILIH</button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="w-full md:w-80 p-6 bg-slate-800/10 flex flex-col space-y-6">
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
                  <button onClick={() => setPermitType("KELUAR")} className={`py-3 rounded-lg font-black text-[10px] ${permitType === 'KELUAR' ? 'bg-red-600 text-white' : 'text-slate-500'}`}>KELUAR</button>
                  <button onClick={() => setPermitType("MASUK")} className={`py-3 rounded-lg font-black text-[10px] ${permitType === 'MASUK' ? 'bg-blue-600 text-white' : 'text-slate-500'}`}>MASUK</button>
                </div>
                <textarea rows={4} className="w-full bg-slate-900 border border-slate-800 p-4 rounded-2xl text-white outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium" placeholder="Alasan izin..." value={reason} onChange={(e) => setReason(e.target.value)} />
                <button disabled={!selection || !reason.trim() || submitting} onClick={handleSubmit} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800/50 text-white rounded-2xl font-black text-xs shadow-xl active:scale-95">
                  {submitting ? <Loader2 className="animate-spin mx-auto" size={18} /> : "SIMPAN & CETAK SLIP"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🟢 PRINT SLIP - PERBAIKAN KOLOM TTD & PAS 1 LEMBAR */}
      {printData && (
        <div id="print-slip" className="hidden print:flex flex-col justify-between bg-white text-black p-4 border border-black h-[10cm] w-[10cm] font-sans">
          {/* Header */}
          <div className="text-center border-b-2 border-black pb-2">
            <h2 className="text-[14px] font-black uppercase tracking-tight leading-none">SMAN 1 MARGAASIH</h2>
            <p className="text-[10px] font-bold tracking-widest uppercase mt-1">SURAT IZIN {printData.type}</p>
          </div>
          
          {/* Data Badan */}
          <div className="flex-grow space-y-3 py-4 text-[11px] font-bold uppercase">
            <div className="flex border-b border-dotted border-gray-400">
                <span className="w-24">NAMA SISWA</span>
                <span>: {printData.name}</span>
            </div>
            <div className="flex border-b border-dotted border-gray-400">
                <span className="w-24">KELAS / NIS</span>
                <span>: {printData.className} / {printData.nipd}</span>
            </div>
            <div className="flex border-b border-dotted border-gray-400">
                <span className="w-24">WAKTU IZIN</span>
                <span>: {new Date(printData.time).toLocaleTimeString('id-ID')} WIB</span>
            </div>
            
            <div className="mt-4 text-center border-2 border-black p-2 bg-gray-50">
              <p className="text-[8px] italic underline mb-1">keterangan alasan:</p>
              <p className="text-[14px] font-black italic">"{printData.reason}"</p>
            </div>
          </div>
          
          {/* 🟢 KOLOM TTD PERBAIKAN (SEJAJAR KIRI-KANAN) */}
          <div className="flex justify-between items-end px-4 pb-2">
            <div className="flex flex-col items-center">
                <p className="text-[9px] font-bold mb-10">Siswa Terkait,</p>
                <div className="w-20 border-t border-black"></div>
            </div>
            <div className="flex flex-col items-center">
                <p className="text-[9px] font-bold mb-10">Guru Piket,</p>
                <div className="w-20 border-t border-black"></div>
            </div>
          </div>
        </div>
      )}

      {/* CSS CETAK FINAL - GARANSI 1 HALAMAN */}
      {/* CSS CETAK REVISI - ANTI LOADING & FIX 1 HALAMAN */}
      <style jsx global>{`
        @media print {
          /* 1. Sembunyikan elemen lain tanpa menghapusnya dari DOM */
          body > *:not(#print-slip) {
            position: absolute !important;
            top: -9999px !important;
            left: -9999px !important;
            height: 0 !important;
            overflow: hidden !important;
          }

          /* 2. Tampilkan slip dan paksa ukuran pas 10x10 */
          #print-slip {
            visibility: visible !important;
            display: flex !important;
            flex-direction: column !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 10cm !important;
            height: 10cm !important;
            padding: 0.5cm !important;
            margin: 0 !important;
            background: white !important;
            box-sizing: border-box !important;
            z-index: 9999 !important;
          }

          #print-slip * {
            visibility: visible !important;
          }

          /* 3. Atur kolom TTD agar rapi di bawah */
          .ttd-container {
            margin-top: auto !important;
            display: flex !important;
            justify-content: space-between !important;
            padding: 0 0.5cm !important;
          }

          /* 4. Setup Printer 10x10 tanpa margin sisa */
          @page {
            size: 10cm 10cm !important;
            margin: 0 !important;
          }
        }

        /* Tampilan layar normal */
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
}