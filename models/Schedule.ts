import mongoose, { Schema, model, models } from 'mongoose';

// Interface untuk TypeScript agar coding lebih tenang (Type Safety)
export interface ISchedule {
  day: string;
  period: number;
  timeRange: string;
  rombel: string;
  teacherCode: string;
  teacherName: string;
  subject: string;
  nip?: string;
  academicYear: string;
  semester: string;
}

const ScheduleSchema = new Schema<ISchedule>(
  {
    day: { 
      type: String, 
      required: [true, 'Hari harus diisi'],
      enum: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] 
    },
    period: { 
      type: Number, 
      required: [true, 'Jam ke-berapa harus diisi'] 
    },
    timeRange: { 
      type: String, 
      required: [true, 'Rentang waktu harus diisi'] // Contoh: 07.10-07.50
    },
    rombel: { 
      type: String, 
      required: [true, 'Rombel/Kelas harus diisi'] // Contoh: 10-1 atau 11-IPA-1
    },
    teacherCode: { 
      type: String, 
      required: [true, 'Kode guru hasil mapping PDF harus ada'] // Contoh: 32A, 18, 35B
    },
    teacherName: { 
      type: String, 
      required: [true, 'Nama guru harus diisi'] 
    },
    subject: { 
      type: String, 
      required: [true, 'Mata pelajaran harus diisi'] 
    },
    nip: { 
      type: String 
    },
    academicYear: { 
      type: String, 
      default: '2025/2026' 
    },
    semester: { 
      type: String, 
      enum: ['Ganjil', 'Genap'], 
      default: 'Genap' 
    }
  },
  { 
    timestamps: true // Otomatis mencatat kapan jadwal ini di-upload/di-update
  }
);

// Mencegah error "OverwriteModelError" di Next.js saat hot-reload
const Schedule = models.Schedule || model<ISchedule>('Schedule', ScheduleSchema);

export default Schedule;