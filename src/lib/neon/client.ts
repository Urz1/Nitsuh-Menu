import { neon } from '@neondatabase/serverless';

let ipv4Configured = false;
function ensureIPv4Agent() {
  if (typeof window !== 'undefined' || ipv4Configured) return;
  try {
    const dynamicRequire = eval('require');
    const dns = dynamicRequire('dns');
    const { Agent, setGlobalDispatcher } = dynamicRequire('undici');
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
    ipv4Configured = true;
  }
}

function resolveDatabaseUrl(): string | null {
  if (typeof window !== 'undefined') return null;
  const direct = (process.env.DATABASE_URL || process.env.NEON_DATABASE_URL || process.env.NEON_DB)?.trim();
  if (direct) return direct;

  try {
    const dynamicRequire = eval('require');
    const fs = dynamicRequire('fs');
    const path = dynamicRequire('path');
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/(?:DATABASE_URL|NEON_DATABASE_URL|NEON_DB)=([^\r\n]+)/);
      if (match && match[1]) {
        const val = match[1].trim().replace(/^['"]|['"]$/g, '');
        process.env.DATABASE_URL = val;
        return val;
      }
    }
  } catch {}
  return null;
}

export function getNeon() {
  if (typeof window !== 'undefined') return null;
  const dbUrl = resolveDatabaseUrl();
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
  return Boolean(resolveDatabaseUrl());
}
