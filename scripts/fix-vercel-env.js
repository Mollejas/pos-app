const fs = require('fs');
const path = require('path');
const { execSync, spawnSync } = require('child_process');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');

const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    let key = match[1].trim();
    let value = match[2].trim();
    // Remove quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
});

const keysToSync = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_REFRESH_TOKEN',
  'GOOGLE_SHEET_ID'
];

console.log('Syncing variables to Vercel (removing quotes)...');

keysToSync.forEach(key => {
  if (!env[key]) {
    console.log(`Skipping ${key} (not found in .env.local)`);
    return;
  }

  const value = env[key];
  console.log(`Processing ${key}... (Length: ${value.length})`);

  // 1. Remove existing
  try {
    execSync(`npx vercel env rm ${key} production --yes`, { stdio: 'ignore' });
    console.log(`  - Removed old ${key}`);
  } catch (e) {
    // Ignore error if it didn't exist
  }

  // 2. Add new
  // We use spawnSync with input option to pass value via stdin safely
  const result = spawnSync('cmd', ['/c', 'npx', 'vercel', 'env', 'add', key, 'production'], {
    input: value,
    encoding: 'utf-8'
  });

  if (result.status === 0) {
    console.log(`  - Added new ${key}`);
  } else {
    console.error(`  - Failed to add ${key}`);
    console.error(result.stderr);
  }
});

console.log('Done! Please redeploy.');
