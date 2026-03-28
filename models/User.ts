import mongoose, { Schema, model, models } from "mongoose";

const UserSchema = new Schema(
  {
    // Nama User untuk Login (biasanya NIP atau Email)
    username: { 
      type: String, 
      required: true, 
      unique: true,
      trim: true 
    },
    
    // Password terenkripsi
    password: { 
      type: String, 
      required: true 
    },

    /**
     * RELASI KE MODEL TEACHER
     * Menghubungkan akun ini dengan data profil guru di SMAN 1 Margaasih
     */
    teacherId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Teacher",
      required: true 
    },

    /**
     * HAK AKSES SISTEM
     * Menentukan menu apa saja yang muncul di Sidebar
     */
    role: { 
      type: String, 
      enum: ['admin', 'piket', 'kesiswaan'], 
      default: 'piket' 
    },

    // Status akun aktif atau tidak
    isActive: { 
      type: Boolean, 
      default: true 
    },

    // Tracking login terakhir
    lastLogin: { 
      type: Date 
    }
  },
  { 
    timestamps: true 
  }
);

// Pastikan model tidak dideklarasi ulang saat hot reload
const User = models.User || model("User", UserSchema);

export default User;