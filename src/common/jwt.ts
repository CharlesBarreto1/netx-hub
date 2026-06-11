import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * JWT HS256 mínimo (sem dependência externa) pra sessão da central do cliente.
 * Só o necessário: sign + verify com expiração. Segredo em HUB_PORTAL_JWT_SECRET.
 */

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
function b64urlJson(obj: unknown): string {
  return b64url(JSON.stringify(obj));
}
function fromB64url(s: string): Buffer {
  const b = s.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b.length % 4 === 0 ? '' : '='.repeat(4 - (b.length % 4));
  return Buffer.from(b + pad, 'base64');
}

export interface PortalJwtPayload {
  sub: string; // hubUserId
  lid: string; // licenseeId
  email: string;
  iat: number;
  exp: number;
}

function secret(): string {
  const s = process.env.HUB_PORTAL_JWT_SECRET;
  if (!s || s.length < 16) {
    throw new Error('HUB_PORTAL_JWT_SECRET ausente/curto (mín. 16 chars).');
  }
  return s;
}

export function signPortalJwt(
  payload: Omit<PortalJwtPayload, 'iat' | 'exp'>,
  ttlSeconds = 12 * 3600,
): string {
  const now = Math.floor(Date.now() / 1000);
  const full: PortalJwtPayload = { ...payload, iat: now, exp: now + ttlSeconds };
  const head = b64urlJson({ alg: 'HS256', typ: 'JWT' });
  const body = b64urlJson(full);
  const sig = b64url(createHmac('sha256', secret()).update(`${head}.${body}`).digest());
  return `${head}.${body}.${sig}`;
}

export function verifyPortalJwt(token: string): PortalJwtPayload | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [head, body, sig] = parts;
  const expected = createHmac('sha256', secret()).update(`${head}.${body}`).digest();
  const got = fromB64url(sig);
  if (got.length !== expected.length || !timingSafeEqual(got, expected)) return null;
  let payload: PortalJwtPayload;
  try {
    payload = JSON.parse(fromB64url(body).toString('utf8'));
  } catch {
    return null;
  }
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) {
    return null;
  }
  return payload;
}
