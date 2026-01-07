import { NextResponse } from 'next/server';
import { getProducts, addProduct, updateProduct, initializeSheets } from '@/lib/googleSheets';

export async function GET() {
  try {
    await initializeSheets();
    const products = await getProducts();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.code || !body.description || !body.price) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    await initializeSheets();
    
    await addProduct({
      code: body.code,
      description: body.description,
      price: Number(body.price),
      image: body.image
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear producto' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { code, ...updates } = body;

    if (!code) {
      return NextResponse.json({ error: 'Código requerido' }, { status: 400 });
    }

    await initializeSheets();
    await updateProduct(code, updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar producto' },
      { status: 500 }
    );
  }
}
