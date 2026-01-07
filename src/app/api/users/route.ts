import { NextResponse } from 'next/server';
import { getUsers, addUser, initializeSheets } from '@/lib/googleSheets';

export async function GET() {
  try {
    await initializeSheets();
    const users = await getUsers();
    // Remove passwords
    const safeUsers = users.map(({ password, ...u }) => u);
    return NextResponse.json(safeUsers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (!body.email || !body.password || !body.numeroalmacen) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      );
    }

    await initializeSheets();
    
    await addUser({
      email: body.email,
      password: body.password,
      role: body.role || 'user',
      numeroalmacen: body.numeroalmacen
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear usuario' },
      { status: 500 }
    );
  }
}
