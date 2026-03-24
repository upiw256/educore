import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const BARRIER = process.env.DAPODIK_BARRIER || "margaasih";

    const response = await fetch('http://app.sman1margaasih.sch.id:30000/api', {
      method: 'GET',
      headers: {
        "X-Barrier": BARRIER, // INI YANG BIKIN 401 KALAU HILANG
        "Content-Type": "application/json"
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      return NextResponse.json({ connected: false, status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({ 
      connected: data.status === 'connected' 
    });

  } catch (error) {
    return NextResponse.json({ connected: false });
  }
}