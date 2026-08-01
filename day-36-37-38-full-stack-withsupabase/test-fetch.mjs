import fs from 'fs';

const env = fs.readFileSync('.env', 'utf-8');
const envVars = Object.fromEntries(
  env.split('\n').filter(l => l && l.includes('=')).map(l => l.trim().split('='))
);

const url = envVars.VITE_SUPABASE_URL + '/rest/v1/connections';
const key = envVars.VITE_SUPABASE_ANON_KEY;

async function run() {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id: 'test-123',
      source: 'c1',
      target: 'c2',
      sourcePort: 'right',
      targetPort: 'left',
      type: 'related',
      label: '',
      workspace_id: 'test-workspace'
    })
  });
  const data = await res.json();
  console.log("Status:", res.status);
  console.log("Error Response:", JSON.stringify(data, null, 2));
}

run();
