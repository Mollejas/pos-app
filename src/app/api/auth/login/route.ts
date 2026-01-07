import { NextResponse } from 'next/server';
import { getUsers, initializeSheets } from '@/lib/googleSheets';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    let users;
    try {
      users = await getUsers();
    } catch (error) {
      console.log('Error fetching users, attempting initialization...', error);
      await initializeSheets();
      users = await getUsers();
    }

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      // Return user info without password
      const { password, ...userInfo } = user;
      return NextResponse.json({ success: true, user: userInfo });
    }

    console.log('Login failed: User not found or password mismatch');
    return NextResponse.json(
      { success: false, error: 'Credenciales inválidas' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, error: 'Error al iniciar sesión' },
      { status: 500 }
    );
  }
}
