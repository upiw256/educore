import dbConnect from '@/lib/mongodb';
import Student from '@/models/Student';

export async function getDaftarKelas() {
  await dbConnect();
  
  try {
    // Mengambil nilai unik dari field 'nama_rombel'
    const classes: string[] = await Student.distinct('nama_rombel');
    
    // Filter untuk membuang nilai null/empty dan urutkan
    return classes
      .filter(Boolean) 
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
  } catch (error) {
    console.error("Gagal ambil daftar kelas dari MongoDB:", error);
    return [];
  }
}