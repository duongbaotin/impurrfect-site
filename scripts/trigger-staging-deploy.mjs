#!/usr/bin/env node

// Trigger Vercel Deploy Hook to rebuild and stage https://impurrfect-bar.meowracle.space/menu-preview
// Used by @impurrfect-site whenever Baserow menu data changes.

import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const HOOK_PATH = join(homedir(), '.secrets', 'vercel-deploy-hook');

try {
  const hookUrl = readFileSync(HOOK_PATH, 'utf8').trim();
  if (!hookUrl) {
    console.error(`Error: ${HOOK_PATH} is empty.`);
    process.exit(1);
  }

  console.log('📡 Triggering Vercel Deploy Hook for /menu-preview staging...');
  const res = await fetch(hookUrl, { method: 'POST' });

  if (!res.ok) {
    console.error(`❌ Deploy hook failed with HTTP ${res.status}: ${res.statusText}`);
    process.exit(1);
  }

  const data = await res.json();
  console.log(`✅ Vercel deploy triggered successfully!`);
  if (data?.job?.id) {
    console.log(`   Job ID: ${data.job.id} (Status: ${data.job.state})`);
  }
  console.log('   Vercel is now compiling Baserow data into https://impurrfect-bar.meowracle.space/menu-preview (~25-35s).');
} catch (err) {
  console.error(`❌ Failed to trigger Vercel deploy:`, err.message);
  process.exit(1);
}
