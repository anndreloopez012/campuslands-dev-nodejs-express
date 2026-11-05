import { createHmac } from 'node:crypto';

const SECRET_KEY = 'clave-secreta-foodtruck-2026';

function base64UrlEncode(str) {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) str += '=';
  return Buffer.from(str, 'base64').toString('utf8');
}

export const signToken = (payload) => {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify({ ...payload, exp: Date.now() + 3600000 }));
  const signature = createHmac('sha256', SECRET_KEY)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

export const verifyToken = (token) => {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Token JWT malformado.');

  const [encodedHeader, encodedPayload, signature] = parts;
  const expectedSignature = createHmac('sha256', SECRET_KEY)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');

  if (signature !== expectedSignature) throw new Error('Firma del token inválida.');

  const payload = JSON.parse(base64UrlDecode(encodedPayload));
  if (payload.exp && Date.now() > payload.exp) throw new Error('Token expirado.');

  return payload;
};
