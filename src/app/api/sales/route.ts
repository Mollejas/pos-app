import { NextResponse } from 'next/server';
import { createSale } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const { sale, details } = await request.json();
    const folio = await createSale(sale, details);
    return NextResponse.json({ success: true, folio });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating sale' }, { status: 500 });
  }
}
