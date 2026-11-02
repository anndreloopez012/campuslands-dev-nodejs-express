import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

// Formato guardado: salt:hash (ambos en hex)
export const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return salt + ':' + hash;
};

export const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split(':');
  const candidate = scryptSync(password, salt, 64);
  return timingSafeEqual(candidate, Buffer.from(hash, 'hex'));
};
