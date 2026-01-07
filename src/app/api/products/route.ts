import { NextResponse } from 'next/server';
import { getProducts, addProduct } from '@/lib/googleSheets';

export async function GET() {
  try {
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error: any) {
    console.error('API Error (GET /products):', error);
    return NextResponse.json({ 
      error: 'Error fetching products', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await addProduct(body);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error adding product' }, { status: 500 });
  }
}
