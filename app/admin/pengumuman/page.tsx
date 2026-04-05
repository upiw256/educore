'use client';

import React, { useState, useEffect } from 'react';
import { Megaphone, Plus, Search, MapPin, Loader2, Edit, Trash2 } from 'lucide-react';

interface Pengumuman {
  _id: string;
  title: string;
  date: string;
  type: string;
  content: string;
  isActive: boolean;
}

export default function PengumumanPage() {
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    date: '',
    type: 'Pengumuman',
    content: '',
    isActive: true,
  });

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      const res = await fetch('/api/pengumuman');
      const data = await res.json();
      setPengumuman(data);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (item?: Pengumuman) => {
    if (item) {
      setFormData({
        _id: item._id,
        title: item.title,
        date: new Date(item.date).toISOString().split('T')[0],
        type: item.type,
        content: item.content,
        isActive: item.isActive,
      });
    } else {
      setFormData({
        _id: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        type: 'Pengumuman',
        content: '',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitLoading(true);

    try {
      const isEdit = formData._id !== '';
      const url = isEdit ? `/api/pengumuman/${formData._id}` : '/api/pengumuman';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchPengumuman();
      }
    } catch (error) {
      console.error('Failed to save announcement:', error);
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    try {
      const res = await fetch(`/api/pengumuman/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchPengumuman();
      }
    } catch (error) {
      console.error('Failed to delete announcement:', error);
    }
  };

  const handleToggleActive = async (item: Pengumuman) => {
    try {
      const res = await fetch(`/api/pengumuman/${item._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !item.isActive }),
      });
      if (res.ok) fetchPengumuman();
    } catch (error) {
      console.error('Failed to toggle active state:', error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/20 p-6 rounded-2xl border border-slate-800/50">
        <div className="flex items-center gap-4">
          <div className="bg-electric/10 p-3 rounded-xl border border-electric/20">
            <Megaphone className="w-6 h-6 text-electric" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Manajemen Pengumuman</h1>
            <p className="text-slate-400 text-sm mt-1">Kelola berita, agenda, dan pengumuman sekolah</p>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-electric hover:bg-electric/80 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-electric/20"
        >
          <Plus size={18} />
          <span>Tambah Pengumuman</span>
        </button>
      </div>

      <div className="glass-card rounded-2xl border border-slate-800/50 overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center">
             <Loader2 className="w-8 h-8 text-electric animate-spin" />
          </div>
        ) : pengumuman.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
             Belum ada pengumuman tersedia.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-semibold">Judul & Isi</th>
                  <th className="px-6 py-4 font-semibold text-center w-32">Kategori</th>
                  <th className="px-6 py-4 font-semibold text-center w-32">Tampil Di Dashboard</th>
                  <th className="px-6 py-4 font-semibold text-right w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {pengumuman.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white text-base mb-1">{item.title}</div>
                      <div className="text-slate-500 text-xs mb-2">
                        {new Date(item.date).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                      <div className="text-slate-400 line-clamp-2">{item.content}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
                        item.type === 'Pengumuman' ? 'bg-orange-500/20 text-orange-400 border border-orange-500/20' : 
                        item.type === 'Berita' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' : 
                        'bg-purple-500/20 text-purple-400 border border-purple-500/20'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleToggleActive(item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          item.isActive 
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 border hover:bg-emerald-500/30' 
                            : 'bg-slate-800 text-slate-500 border-slate-700 border hover:bg-slate-700'
                        }`}
                      >
                        {item.isActive ? 'AKTIF' : 'NONAKTIF'}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleOpenModal(item)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(item._id)} className="p-2 hover:bg-red-500/20 rounded-lg text-slate-400 hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0f172a] p-6 rounded-2xl w-full max-w-xl border border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-white mb-6">
              {formData._id ? 'Edit Pengumuman' : 'Tambah Pengumuman'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Judul Pengumuman</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-all"
                  placeholder="Misal: Peringatan Hari Pendidikan Nasional"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric transition-all [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Kategori</label>
                  <select
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-electric transition-all"
                  >
                    <option value="Pengumuman">Pengumuman</option>
                    <option value="Berita">Berita</option>
                    <option value="Agenda">Agenda</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Isi Berita / Pengumuman</label>
                <textarea
                  required
                  rows={4}
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-electric focus:ring-1 focus:ring-electric transition-all resize-none"
                  placeholder="Tulis detail lengkap di sini..."
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitLoading}
                  className="flex items-center gap-2 bg-electric hover:bg-electric/80 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-electric/20 disabled:opacity-50"
                >
                  {isSubmitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Simpan Data</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
