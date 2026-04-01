import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import Teacher from "@/models/Teacher";
import bcrypt from "bcryptjs";

// 1. GET: Mengambil semua user beserta data profile gurunya
export async function GET() {
  await dbConnect();
  try {
    const users = await User.find({})
      .populate("teacherId", "nama nip foto") // Ambil data parsial dari Teacher
      .sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Gagal mengambil data user" }, { status: 500 });
  }
}

// 2. POST: Membuat atau Update Akses User (Admin/Piket/Kesiswaan)
export async function POST(req: Request) {
  await dbConnect();
  try {
    const body = await req.json();
    const { teacherId, role, username, password } = body;

    // Cari data guru untuk validasi
    const teacher = await Teacher.findById(teacherId);
    if (!teacher) {
      return NextResponse.json({ error: "Data Guru tidak ditemukan" }, { status: 404 });
    }

    // Default username pake NIP kalau tidak diisi
    const finalUsername = username || teacher.nip || teacher.nama.replace(/\s+/g, '').toLowerCase();
    
    // Default password '123456' kalau tidak diisi, lalu dihash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || "123456", salt);

    // Proses Upsert: Cari berdasarkan teacherId, update datanya, atau buat baru
    const userAccount = await User.findOneAndUpdate(
      { teacherId: teacherId },
      { 
        username: finalUsername,
        password: hashedPassword,
        role: role,
        isActive: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({
      message: `Akses ${role} berhasil dikonfigurasi untuk ${teacher.nama}`,
      data: userAccount
    }, { status: 200 });

  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: "Username sudah digunakan oleh akun lain" }, { status: 400 });
    }
    return NextResponse.json({ error: "Gagal memproses hak akses" }, { status: 500 });
  }
}

// 3. DELETE: Mencabut akses (Menghapus akun user tanpa menghapus data guru)
export async function DELETE(req: Request) {
  await dbConnect();
  try {
    const { userId } = await req.json();
    await User.findByIdAndDelete(userId);
    return NextResponse.json({ message: "Hak akses berhasil dicabut" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal mencabut akses" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  await dbConnect();
  try {
    const { userId, newPassword } = await req.json();

    if (!userId || !newPassword) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Hash password baru dengan salt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update hanya password-nya saja
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Password berhasil diperbarui secara permanen" 
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Gagal memperbarui password" }, { status: 500 });
  }
}