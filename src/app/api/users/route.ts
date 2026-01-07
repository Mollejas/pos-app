import { NextResponse } from 'next/server';
import { getUsers, addUser, updateUser, deleteUser, initializeSheets } from '@/lib/googleSheets';

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

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { email, ...updates } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    await initializeSheets();
    await updateUser(email, updates);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al actualizar usuario' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
    }

    await initializeSheets();
    await deleteUser(email);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al eliminar usuario' },
      { status: 500 }
    );
  }
}
