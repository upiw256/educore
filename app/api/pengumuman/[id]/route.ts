import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pengumuman from '@/models/Pengumuman';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await dbConnect();
    const pengumuman = await Pengumuman.findById(id);
    if (!pengumuman) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(pengumuman);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    const data = await request.json();
    await dbConnect();
    
    // Parse date if it arrives as string
    if (data.date && typeof data.date === 'string') {
        data.date = new Date(data.date);
    }
    
    // Remove _id from data to avoid Mongoose update conflicts
    if (data._id) {
        delete data._id;
    }

    const pengumuman = await Pengumuman.findByIdAndUpdate(id, data, { new: true });
    if (!pengumuman) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(pengumuman);
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = (await params).id;
    await dbConnect();
    const pengumuman = await Pengumuman.findByIdAndDelete(id);
    if (!pengumuman) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
