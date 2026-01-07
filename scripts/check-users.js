const { google } = require('googleapis');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/"/g, '').trim();
});

async function checkUsers() {
  const auth = new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
  auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });
  
  const doc = new GoogleSpreadsheet(env.GOOGLE_SHEET_ID, auth);
  await doc.loadInfo();
  
  const sheet = doc.sheetsByTitle['Usuarios'];
  if (!sheet) {
    console.log('NO EXISTE LA HOJA USUARIOS');
    return;
  }
  
  const rows = await sheet.getRows();
  console.log('Usuarios encontrados:', rows.length);
  rows.forEach(row => {
    console.log(`- Email: ${row.get('email')}, Pass: ${row.get('password')}, Rol: ${row.get('role')}`);
  });
}

checkUsers().catch(console.error);
