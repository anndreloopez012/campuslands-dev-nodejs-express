import { createHmac, timingSafeEqual } from 'node:crypto';

const SECRET = process.env.JWT_SECRET || 'dev-secret-cambiar';

const encode = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
const sign = (data) => createHmac('sha256', SECRET).update(data).digest();

export const signToken = (payload, expiresInSec = 3600) => {
  const header = encode({ alg: 'HS256', typ: 'JWT' });
  const body = encode({ ...payload, exp: Math.floor(Date.now() / 1000) + expiresInSec });
  return header + '.' + body + '.' + sign(header + '.' + body).toString('base64url');
};

export const verifyToken = (token) => {
  const parts = String(token).split('.');
  if (parts.length !== 3) throw new Error('Token malformado');

  const given = Buffer.from(parts[2], 'base64url');
  const expected = sign(parts[0] + '.' + parts[1]);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw new Error('Firma inválida');
  }

  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expirado');
  return payload;
};
