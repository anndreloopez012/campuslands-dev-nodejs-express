import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const LARGO = 32;

export function hashPassword(password, sal = randomBytes(16)) {
  const hash = scryptSync(password, sal, LARGO);
  return `${sal.toString('hex')}:${hash.toString('hex')}`;
}

export function verificarPassword(password, almacenado) {
  const [sal, hash] = almacenado.split(':');
  const esperado = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, Buffer.from(sal, 'hex'), LARGO);
  return esperado.length === actual.length && timingSafeEqual(esperado, actual);
}
