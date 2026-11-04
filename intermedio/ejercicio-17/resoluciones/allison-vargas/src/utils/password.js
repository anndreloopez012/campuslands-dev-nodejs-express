import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const derivar = promisify(scrypt);
const LONGITUD = 64;

export async function hashear(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await derivar(password, salt, LONGITUD);
  return `${salt}:${hash.toString('hex')}`;
}

export async function verificar(password, guardado) {
  const [salt, hash] = guardado.split(':');
  const esperado = Buffer.from(hash, 'hex');
  const calculado = await derivar(password, salt, esperado.length);
  return timingSafeEqual(calculado, esperado);
}
