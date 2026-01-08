import { NextResponse } from 'next/server';
import { createSale, getSales, getSaleDetails } from '@/lib/googleSheets';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const folio = searchParams.get('folio');

    if (folio) {
      const details = await getSaleDetails(parseInt(folio));
      return NextResponse.json(details);
    }

    const sales = await getSales();
    return NextResponse.json(sales);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error fetching sales' }, { status: 500 });
  }
}

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
