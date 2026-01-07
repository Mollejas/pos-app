import { NextResponse } from 'next/server';
import { getCustomers, addCustomer } from '@/lib/googleSheets';

export async function GET() {
  try {
    const customers = await getCustomers();
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching customers' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await addCustomer(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error adding customer' }, { status: 500 });
  }
}
