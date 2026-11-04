import { createHash, randomBytes } from 'node:crypto';

export const generarToken = () => randomBytes(32).toString('hex');

export const huella = (token) => createHash('sha256').update(token).digest('hex');
