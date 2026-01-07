const { google } = require('googleapis');
const readline = require('readline');
const path = require('path');
const fs = require('fs');

// Load env to get Client ID/Secret
const envPath = path.resolve(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[match[1]] = val;
  }
});

const CLIENT_ID = env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Error: No se encontraron GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en .env.local');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: SCOPES,
  prompt: 'consent' // Force to get refresh_token
});

console.log('1. Asegúrate de haber puesto tu App en modo "Producción" (Publish App) en Google Cloud Console.');
console.log('2. Autoriza esta aplicación visitando esta URL:\n');
console.log(authUrl);
console.log('\n');

rl.question('3. Introduce el código de esa página aquí: ', (code) => {
  oauth2Client.getToken(code, (err, token) => {
    if (err) return console.error('Error obteniendo access token', err);
    
    console.log('\n¡Éxito! Aquí está tu nuevo REFRESH TOKEN PERMANENTE:');
    console.log('================================================');
    console.log(token.refresh_token);
    console.log('================================================');
    console.log('\nCopia este token y actualiza la variable GOOGLE_REFRESH_TOKEN en Vercel una última vez.');
    
    rl.close();
  });
});
