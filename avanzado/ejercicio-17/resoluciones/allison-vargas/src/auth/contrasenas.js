import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const COSTO = 16384;
const LARGO = 32;

export function hashear(contrasena, { costo = COSTO } = {}) {
  const sal = randomBytes(16);
  const hash = scryptSync(contrasena, sal, LARGO, { N: costo });
  return `scrypt$${costo}$${sal.toString('base64url')}$${hash.toString('base64url')}`;
}

export function comparar(contrasena, guardado) {
  const [tipo, costo, sal, hash] = String(guardado).split('$');
  if (tipo !== 'scrypt' || !sal || !hash) return false;
  const esperado = Buffer.from(hash, 'base64url');
  const calculado = scryptSync(contrasena, Buffer.from(sal, 'base64url'), esperado.length, { N: Number(costo) });
  return timingSafeEqual(esperado, calculado);
}

// se usa cuando el correo no existe para que la respuesta tarde lo mismo y no revele que cuentas hay
export const HASH_FALSO = hashear(randomBytes(12).toString('hex'));
