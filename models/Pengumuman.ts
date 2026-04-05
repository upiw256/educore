import mongoose, { Schema, Document } from 'mongoose';

export interface IPengumuman extends Document {
  title: string;
  date: Date;
  type: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
}

const PengumumanSchema: Schema = new Schema({
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: ['Pengumuman', 'Berita', 'Agenda'],
    default: 'Pengumuman'
  },
  content: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  }
});

// Avoid OverwriteModelError
export default mongoose.models.Pengumuman || mongoose.model<IPengumuman>('Pengumuman', PengumumanSchema);
