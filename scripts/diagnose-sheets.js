const fs = require('fs');
const path = require('path');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { OAuth2Client } = require('google-auth-library');

// 1. Load env vars manually
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let value = match[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[match[1]] = value;
  }
});

console.log('Environment variables loaded:');
console.log('GOOGLE_CLIENT_ID:', env.GOOGLE_CLIENT_ID ? 'OK' : 'MISSING');
console.log('GOOGLE_CLIENT_SECRET:', env.GOOGLE_CLIENT_SECRET ? 'OK' : 'MISSING');
console.log('GOOGLE_REFRESH_TOKEN:', env.GOOGLE_REFRESH_TOKEN ? 'OK' : 'MISSING');
console.log('GOOGLE_SHEET_ID:', env.GOOGLE_SHEET_ID ? 'OK' : 'MISSING');

async function testConnection() {
  try {
    const auth = new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
    auth.setCredentials({ refresh_token: env.GOOGLE_REFRESH_TOKEN });

    console.log('Authenticating...');
    const doc = new GoogleSpreadsheet(env.GOOGLE_SHEET_ID, auth);
    
    console.log('Loading info...');
    await doc.loadInfo();
    console.log('Spreadsheet loaded successfully: ' + doc.title);
    
    console.log('Sheets:', doc.sheetCount);
    Object.keys(doc.sheetsByTitle).forEach(title => console.log(' - ' + title));

    // Try to create a test sheet if none exist (or just check permissions)
    if (!doc.sheetsByTitle['TestAuth']) {
        console.log('Attempting to add sheet...');
        // await doc.addSheet({ title: 'TestAuth' }); // Commented out to avoid cluttering if it works, just reading is enough proof of auth usually
    }

  } catch (error) {
    console.error('ERROR DETECTED:');
    console.error(error);
    if (error.response) {
        console.error('Response data:', error.response.data);
    }
  }
}

testConnection();
