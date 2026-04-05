import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Pengumuman from '@/models/Pengumuman';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly');

    await dbConnect();
    
    let query = {};
    if (activeOnly === 'true') {
      query = { isActive: true };
    }

    const pengumuman = await Pengumuman.find(query).sort({ date: -1 });
    return NextResponse.json(pengumuman);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch pengumuman' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();
    
    // Parse date if it arrives as string
    if (typeof data.date === 'string') {
        data.date = new Date(data.date);
    }
    
    // Remove _id if it is empty string to prevent CastError in Mongoose
    if (!data._id) {
        delete data._id;
    }
    
    const pengumuman = await Pengumuman.create(data);
    return NextResponse.json(pengumuman, { status: 201 });
  } catch (error) {
    console.error('Error creating pengumuman:', error);
    return NextResponse.json({ error: 'Failed to create pengumuman', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
