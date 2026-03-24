"use server";

export async function getJadwalByKelas(kelas: string) {
  try {
    const res = await fetch(`https://jadwalapi.sman1margaasih.sch.id/jadwal/kelas/${kelas}`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
}