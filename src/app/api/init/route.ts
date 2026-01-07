import { NextResponse } from 'next/server';
import { initializeSheets } from '@/lib/googleSheets';

export async function GET() {
  try {
    const success = await initializeSheets();
    if (success) {
      return NextResponse.json({ message: 'Hojas inicializadas correctamente' });
    } else {
      return NextResponse.json({ error: 'Falló la inicialización. Verifica credenciales.' }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
