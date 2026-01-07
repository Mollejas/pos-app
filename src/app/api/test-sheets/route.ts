import { NextResponse } from 'next/server';
import { GoogleSpreadsheet } from 'google-spreadsheet';
import { OAuth2Client } from 'google-auth-library';

export async function GET() {
  const results = {
    envVars: {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasRefreshToken: !!process.env.GOOGLE_REFRESH_TOKEN,
      hasSheetId: !!process.env.GOOGLE_SHEET_ID,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length,
      refreshTokenStart: process.env.GOOGLE_REFRESH_TOKEN?.substring(0, 5),
    },
    step: 'Starting',
    error: null as any,
  };

  try {
    // 1. Validar Credenciales
    results.step = 'Checking Env Vars';
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientId || !clientSecret || !refreshToken || !sheetId) {
      throw new Error('Missing environment variables');
    }

    // 2. Configurar Auth
    results.step = 'Setting up OAuth Client';
    const client = new OAuth2Client(clientId, clientSecret);
    client.setCredentials({ refresh_token: refreshToken });

    // 3. Conectar a Google Sheets
    results.step = 'Initializing GoogleSpreadsheet';
    // @ts-ignore
    const doc = new GoogleSpreadsheet(sheetId, client);

    // 4. Cargar Info
    results.step = 'Loading Doc Info (Connecting to Google API)';
    await doc.loadInfo();

    results.step = 'Success';
    return NextResponse.json({
        ...results,
        docTitle: doc.title,
        sheetCount: doc.sheetCount
    });

  } catch (error: any) {
    console.error('Diagnostic Error:', error);
    return NextResponse.json({
      ...results,
      error: {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        stack: error.stack
      }
    }, { status: 500 });
  }
}
