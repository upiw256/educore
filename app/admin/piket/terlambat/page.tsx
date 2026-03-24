"use client";

import { useEffect, useState } from "react";
import { 
  UserX, Search, Plus, X, Eye, Trash2, Save, Printer, Loader2, ChevronLeft, ChevronRight
} from "lucide-react";

interface LateStudent {
  nis: string;
  name: string;
  className: string;
  lateCount: number;
  lastLateTime: string;
  lastLateDate: string;
}

interface StudentMaster {
  _id: string;
  nama: string;
  nipd: string;
  nama_rombel: string;
}

interface LateHistory {
  _id: string;
  arrival_time: string;
  reason: string;
  recorded_by: string;
}

export default function LateAttendancePage() {
  const [students, setStudents] = useState<LateStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // States Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // States untuk Tambah Record
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [masterResults, setMasterResults] = useState<StudentMaster[]>([]);
  const [selection, setSelection] = useState<StudentMaster | null>(null);
  const [reason, setReason] = useState(""); 
  const [submitting, setSubmitting] = useState(false);

  // States untuk Detail & Edit
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailData, setDetailData] = useState<{name: string, nipd: string, history: LateHistory[] | null}>({
    name: "", nipd: "", history: null
  });
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingTime, setEditingTime] = useState("");
  const [printData, setPrintData] = useState<{name: string, className: string, time: string, reason: string} | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/sync/siswa/late');
      const data = await response.json();
      if (Array.isArray(data)) setStudents(data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  // Logika Filter & Pagination
  const filteredStudents = students.filter(s => 
    (s.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredStudents.slice(indexOfFirstItem, indexOfLastItem);

  // Reset ke halaman 1 saat mencari
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleSearchMaster = async (val: string) => {
    const currentInput = val.toLowerCase();
    if (val.trim().length < 3) { 
      setMasterResults([]); 
      return; 
    }
    try {
      const res = await fetch(`/api/sync/siswa?search=${encodeURIComponent(val)}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const filtered = data.filter(s => {
          const namaSiswa = (s.nama || "").toLowerCase();
          const nipdSiswa = (s.nipd || "");
          return namaSiswa.includes(currentInput) || nipdSiswa.includes(val.trim());
        });
        setMasterResults(filtered);
      }
    } catch (e) { console.error("Search error:", e); }
  };

  const handleSubmitLate = async () => {
    if (!selection || !reason.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/sync/siswa/late', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nipd: selection.nipd,
          reason: reason.trim(),
          arrival_time: new Date().toISOString()
        })
      });
      if (res.ok) {
        setIsModalOpen(false);
        setSelection(null);
        setReason("");
        setMasterResults([]);
        fetchData();
      }
    } catch (e) { console.error(e); } finally { setSubmitting(false); }
  };

  const fetchDetailHistory = async (student: {nis: string, name: string}) => {
    setIsDetailOpen(true);
    setDetailData({ name: student.name, nipd: student.nis, history: null });
    setEditingIndex(null);
    try {
      const response = await fetch(`/api/sync/siswa/late?nipd=${student.nis}&detail=true`);
      const data = await response.json();
      setDetailData({ name: student.name, nipd: student.nis, history: data.history || [] });
    } catch (error) { console.error(error); }
  };

  const handlePrint = (h: LateHistory) => {
    const studentClass = students.find(s => s.nis === detailData.nipd)?.className || "-";
    setPrintData({
      name: detailData.name,
      className: studentClass,
      time: h.arrival_time,
      reason: h.reason
    });
    setTimeout(() => { window.print(); }, 150);
  };

  const handleSaveEditedTime = async (record: LateHistory, newTime: string) => {
    const originalDate = new Date(record.arrival_time);
    const [hours, minutes] = newTime.split(':');
    originalDate.setHours(parseInt(hours));
    originalDate.setMinutes(parseInt(minutes));

    const res = await fetch(`/api/sync/siswa/late`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: record._id, arrival_time: originalDate.toISOString() })
    });

    if (res.ok) {
      setEditingIndex(null);
      fetchDetailHistory({nis: detailData.nipd, name: detailData.name});
      fetchData();
    }
  };

  const handleDeleteHistory = async (id: string) => {
    if (!confirm("Hapus data ini?")) return;
    const res = await fetch(`/api/sync/siswa/late?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchDetailHistory({nis: detailData.nipd, name: detailData.name});
      fetchData();
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 min-h-screen bg-[#020617]">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg"><UserX className="text-red-500 w-7 h-7" /></div>
            Late Attendance
          </h1>
          <p className="text-slate-500 mt-1 font-medium italic">SMAN 1 Margaasih EduCore System</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Plus className="w-4 h-4" /> Add Record
          </button>
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" placeholder="Cari Nama/NIS..."
              className="pl-11 pr-4 py-3 bg-[#0f172a] border border-slate-800 rounded-xl text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none w-[250px]"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* MAIN TABLE */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden print:hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-slate-800/30 text-[10px] uppercase text-slate-500 tracking-[0.2em] border-b border-slate-800 font-black">
                <th className="px-6 py-5">Student Details</th>
                <th className="px-6 py-5 text-center">Class</th>
                <th className="px-6 py-5 text-center">Late Count</th>
                <th className="px-6 py-5 text-center">Last Incident</th>
                <th className="px-6 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {loading ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-500 uppercase text-[10px] font-mono tracking-widest">Loading...</td></tr>
              ) : currentItems.length === 0 ? (
                <tr><td colSpan={5} className="py-20 text-center text-slate-500 uppercase text-[10px]">Data tidak ditemukan</td></tr>
              ) : currentItems.map((student, idx) => (
                <tr key={`student-${student.nis}-${idx}`} className="hover:bg-blue-600/5 transition-all group">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-100 group-hover:text-blue-400 uppercase tracking-tight">{student.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-1">NIS: {student.nis}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center text-slate-400 font-bold text-xs uppercase">{student.className}</td>
                  <td className="px-6 py-5 text-center font-black text-amber-500">{student.lateCount}x</td>
                  <td className="px-6 py-5 text-center">
                    <div className="text-blue-400 font-mono text-[11px] font-bold">{student.lastLateTime}</div>
                    <div className="text-[9px] text-slate-600">{student.lastLateDate}</div>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button onClick={() => fetchDetailHistory(student)} className="p-2 bg-slate-800 hover:bg-blue-600 text-slate-400 hover:text-white rounded-lg transition-all">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* PAGINATION CONTROLS */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-800/20 border-t border-slate-800">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white rounded-lg transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 text-white rounded-lg transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL ADD RECORD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in zoom-in duration-200">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-blue-600/10">
              <h2 className="text-xl font-bold text-white tracking-tight">Tambah Terlambat</h2>
              <button onClick={() => { setIsModalOpen(false); setSelection(null); setReason(""); setMasterResults([]); }} className="text-slate-500 hover:text-white"><X /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2 relative">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Cari Nama Siswa</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" placeholder="Ketik minimal 3 huruf..."
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => handleSearchMaster(e.target.value)}
                  />
                </div>
                {masterResults.length > 0 && (
                  <div className="absolute z-[70] left-0 right-0 max-h-48 overflow-y-auto bg-slate-800 border border-slate-700 rounded-xl mt-1 shadow-2xl ring-1 ring-black">
                    {masterResults.map((s, i) => (
                      <div 
                        key={s._id || `master-${i}`} 
                        onClick={() => { setSelection(s); setMasterResults([]); }} 
                        className="p-3 hover:bg-blue-600 cursor-pointer text-sm border-b border-slate-700 last:border-0 flex justify-between items-center group"
                      >
                        <div>
                          <p className="font-bold text-white group-hover:text-white uppercase">{s.nama || "Tanpa Nama"}</p>
                          <p className="text-[10px] text-slate-400 group-hover:text-blue-100">{s.nama_rombel || "-"} • {s.nipd || "-"}</p>
                        </div>
                        <Plus size={14} className="text-slate-500 group-hover:text-white" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {selection && (
                <div className="p-4 bg-blue-600/10 border border-blue-500/30 rounded-xl">
                  <p className="text-[9px] font-bold text-blue-400 uppercase">Siswa Terpilih:</p>
                  <p className="text-white font-black uppercase tracking-tight">{selection.nama}</p>
                  <p className="text-[10px] text-slate-500 font-mono">{selection.nipd} • {selection.nama_rombel}</p>
                </div>
              )}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Alasan</label>
                <input 
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ketik alasan terlambat..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 font-medium placeholder:text-slate-700"
                />
              </div>
              <button 
                disabled={!selection || !reason.trim() || submitting}
                onClick={handleSubmitLate}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-xl font-black text-sm transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
              >
                {submitting ? <Loader2 className="animate-spin mx-auto" /> : "SIMPAN RECORD"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETAIL RIWAYAT */}
      {isDetailOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md print:hidden">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-blue-600/10">
              <h2 className="text-xl font-bold text-white tracking-tight uppercase">{detailData.name}</h2>
              <button onClick={() => setIsDetailOpen(false)} className="text-slate-500 hover:text-white"><X /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto flex-grow">
              {!detailData.history ? (
                <div className="py-10 text-center"><Loader2 className="animate-spin inline text-blue-500" /></div>
              ) : detailData.history.length === 0 ? (
                <p className="text-center text-slate-500 text-xs italic py-10">Belum ada riwayat keterlambatan.</p>
              ) : detailData.history.map((h, i) => {
                const jamText = new Date(h.arrival_time).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}).replace('.', ':');
                const isEditing = editingIndex === i;
                return (
                  <div key={h._id || `history-${i}`} className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl flex gap-4 group relative overflow-hidden">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 opacity-50" />
                    <div className="flex flex-col items-center justify-center bg-slate-800 rounded-lg min-w-[70px] min-h-[50px]">
                        {isEditing ? (
                           <input type="time" value={editingTime} onChange={(e) => setEditingTime(e.target.value)} className="w-full text-center bg-blue-600 text-white text-xs p-1 rounded-lg outline-none" autoFocus />
                        ) : (
                           <div className="cursor-pointer text-blue-400 font-black text-xs" onClick={() => { setEditingIndex(i); setEditingTime(jamText); }}>{jamText}</div>
                        )}
                    </div>
                    <div className="flex-grow">
                      <p className="text-[10px] text-slate-500 uppercase font-mono">{new Date(h.arrival_time).toLocaleDateString('id-ID', {weekday: 'long', day:'numeric', month:'long', year: 'numeric'})}</p>
                      <p className="text-sm text-slate-200 font-bold italic uppercase tracking-tight">"{h.reason}"</p>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isEditing ? (
                          <button onClick={() => handleSaveEditedTime(h, editingTime)} className="text-green-500"><Save size={16}/></button>
                        ) : (
                          <>
                            <button onClick={() => handlePrint(h)} className="text-emerald-500 hover:scale-110 transition-transform"><Printer size={16}/></button>
                            <button onClick={() => handleDeleteHistory(h._id)} className="text-red-500"><Trash2 size={16}/></button>
                          </>
                        )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* PRINT TEMPLATE */}
      {printData && (
        <div id="printable-permit" className="hidden print:block fixed inset-0 bg-white text-black p-8">
          <div className="text-center border-b-4 border-double border-black pb-4 mb-6">
            <h2 className="text-2xl font-black uppercase tracking-tight">SMAN 1 MARGAASIH</h2>
            <p className="text-[10px] font-bold">Jl. Terusan Galudra No.25, Margaasih, Kab. Bandung</p>
            <div className="mt-4 bg-black text-white text-xs font-black py-2 uppercase tracking-[0.2em]">Surat Izin Masuk Kelas</div>
          </div>
          <div className="space-y-4 text-sm font-medium">
            <div className="flex justify-between border-b border-slate-200 pb-1"><span>Nama Siswa</span><span className="font-bold uppercase">{printData.name}</span></div>
            <div className="flex justify-between border-b border-slate-200 pb-1"><span>Kelas</span><span>{printData.className}</span></div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span>Hari, Tanggal</span>
              <span className="font-bold">{new Date(printData.time).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1">
              <span>Waktu Lapor</span>
              <span className="font-black">Pukul {new Date(printData.time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':')} WIB</span>
            </div>
            <div className="flex justify-between border-b border-slate-200 pb-1"><span>Alasan</span><span className="italic uppercase">"{printData.reason}"</span></div>
          </div>
          <div className="mt-12 flex justify-between text-xs px-10">
            <div className="text-center w-1/3">Siswa<div className="h-16"></div><p className="font-bold underline uppercase">{printData.name.split(' ')[0]}</p></div>
            <div className="text-center w-1/3">Petugas Piket<div className="h-16"></div><p className="font-bold underline uppercase">Admin Piket</p></div>
          </div>
          <p className="text-[8px] text-center mt-10 text-slate-400 font-mono italic">EduCore SMAN 1 Margaasih - Valid System Record</p>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #printable-permit, #printable-permit * { visibility: visible !important; }
          #printable-permit { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
          @page { size: auto; margin: 10mm; }
        }
      `}</style>
    </div>
  );
}