// components/ClassSelector.tsx
"use client";

interface Props {
  daftarKelas: string[];
  onSelect: (kelas: string) => void; // Fungsi untuk mengirim pilihan ke parent
}

export default function ClassSelector({ daftarKelas, onSelect }: Props) {
  return (
    <div className="p-6 bg-[#0f172a] rounded-xl border border-slate-700 shadow-xl">
      <h3 className="text-white font-semibold mb-4 text-lg text-center">Pilih Kelas</h3>
      <select 
        onChange={(e) => onSelect(e.target.value)} // Kirim nilai ke parent, bukan pindah page
        className="w-full p-3 bg-[#1e293b] text-slate-200 rounded-lg border border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all cursor-pointer"
      >
        <option value="">-- Pilih Kelas --</option>
        {daftarKelas.map((kelas) => (
          <option key={kelas} value={kelas}>
            Kelas {kelas}
          </option>
        ))}
      </select>
    </div>
  );
}