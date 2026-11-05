import { randomBytes } from 'node:crypto';
import { crearAlmacenSesiones } from '../auth/sesiones.js';
import { crearControlIntentos } from '../auth/intentos.js';
import { loadJson } from '../utils/loadJson.js';
import { crearServicioAuth } from './auth.service.js';
import { crearServicioReservas } from './reservas.service.js';

function secretoPorDefecto() {
  if (process.env.JWT_SECRETO && process.env.JWT_SECRETO.length >= 32) return process.env.JWT_SECRETO;
  // sin secreto configurado se genera uno al azar: los tokens dejan de servir al reiniciar
  return randomBytes(32).toString('hex');
}

export function crearServicios({
  reloj = () => new Date(),
  secreto = secretoPorDefecto(),
  usuarios = loadJson('usuarios.json'),
  destinos = loadJson('destinos.json'),
  politica,
} = {}) {
  if (typeof secreto !== 'string' || secreto.length < 32) throw new TypeError('El secreto JWT debe tener al menos 32 caracteres');
  const sesiones = crearAlmacenSesiones({ reloj, politica });
  const intentos = crearControlIntentos({ reloj });
  return {
    sesiones,
    auth: crearServicioAuth({
      usuarios, reloj, secreto, sesiones, intentos,
    }),
    reservas: crearServicioReservas({ destinos, reloj }),
  };
}
