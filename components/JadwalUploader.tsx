import { getJadwalByKelas } from "@/lib/api";

export default async function JadwalPage({ params }: { params: { kelas: string } }) {
  const data = await getJadwalByKelas(params.kelas);

  if (!data) return <div>Jadwal tidak ditemukan atau API sedang down.</div>;

  const listHari = Object.keys(data.data_per_hari); // ["SENIN", "SELASA", ...]

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Jadwal Kelas {data.kelas}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {listHari.map((hari) => (
          <div key={hari} className="border rounded-lg p-2 shadow-sm">
            <h2 className="bg-blue-600 text-white p-2 rounded text-center font-bold mb-2">
              {hari}
            </h2>
            {data.data_per_hari[hari].map((item, idx) => (
              <div key={idx} className="border-b last:border-0 py-2 text-sm">
                <div className="font-semibold text-gray-500">{item.waktu} (Jam {item.jam_ke})</div>
                {item.kegiatan.map((k, kIdx) => (
                  <div key={kIdx} className="mt-1">
                    <div className="font-bold text-blue-800">{k.mapel}</div>
                    <div className="text-gray-600 italic">{k.guru}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}