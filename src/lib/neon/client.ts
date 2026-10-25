import { neon } from '@neondatabase/serverless';

let ipv4Configured = false;
function ensureIPv4Agent() {
  if (typeof window !== 'undefined' || ipv4Configured) return;
  try {
    const dns = require('dns');
    const { Agent, setGlobalDispatcher } = require('undici');
    const agent = new Agent({
      connect: {
        lookup: (hostname: string, options: any, callback: any) => {
          dns.lookup(hostname, { ...options, family: 4 }, (err: any, addresses: any) => {
            callback(err, addresses);
          });
        },
      },
    });
    setGlobalDispatcher(agent);
    ipv4Configured = true;
  } catch {
    // Non-fatal if undici or dns is unavailable
    ipv4Configured = true;
  }
}

export function getNeon() {
  if (typeof window !== 'undefined') return null;
  const dbUrl = (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.NEON_DB)?.trim();
  if (!dbUrl) return null;
  try {
    ensureIPv4Agent();
    return neon(dbUrl);
  } catch {
    return null;
  }
}

export function hasNeon(): boolean {
  if (typeof window !== 'undefined') return false;
  return Boolean(process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.NEON_DB);
}

