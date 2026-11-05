import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { levantar } from './cliente.js';

export const AHORA = new Date('2026-11-04T12:00:00.000Z');

export const levantarApi = ({ reloj = () => AHORA, datos } = {}) =>
  levantar(crearApp({ servicios: crearServicios({ reloj, datos }) }));
