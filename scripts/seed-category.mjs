/**
 * Seed script: creates a test forum category in Firestore via REST API.
 * Refreshes the Firebase CLI's OAuth token, then uses it to call Firestore REST.
 *
 * Usage:  node scripts/seed-category.mjs
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const Configstore = require('configstore');
const store = new Configstore('firebase-tools');
const tokens = store.get('tokens');

if (!tokens?.refresh_token) {
  console.error('No Firebase CLI credentials found. Run: npx firebase login');
  process.exit(1);
}

// Firebase CLI's OAuth client credentials (public, embedded in firebase-tools source)
const CLIENT_ID = '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com';
const CLIENT_SECRET = 'j9iVZfS8kkCEFUPaAeJV0sAi';

const PROJECT_ID = 'catalyst-codex-db';
const BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function refreshAccessToken() {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: tokens.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Token refresh failed: ${res.status} ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

async function seed() {
  console.log('Refreshing access token...');
  const accessToken = await refreshAccessToken();

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };

  // Check if category already exists
  const listRes = await fetch(`${BASE}/categories?pageSize=100`, { headers });

  if (listRes.ok) {
    const { documents = [] } = await listRes.json();
    const existing = documents.find(
      (d) => d.fields?.name?.stringValue === 'General Discussion'
    );
    if (existing) {
      const id = existing.name.split('/').pop();
      console.log(`Category "General Discussion" already exists (id: ${id}), skipping.`);
      return;
    }
  }

  // Create the category
  const createRes = await fetch(`${BASE}/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      fields: {
        name: { stringValue: 'General Discussion' },
        description: {
          stringValue: 'Chat about anything related to the Awakening community.',
        },
        sortOrder: { integerValue: '1' },
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.text();
    throw new Error(`Failed to create category: ${createRes.status} ${err}`);
  }

  const created = await createRes.json();
  const id = created.name.split('/').pop();
  console.log(`Created category "General Discussion" with id: ${id}`);
}

seed()
  .then(() => {
    console.log('Seed complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seed failed:', err.message);
    process.exit(1);
  });
