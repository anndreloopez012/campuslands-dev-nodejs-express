import { crearAppLegacy } from '../legacy/app.legacy.js';
import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { levantar } from './cliente.js';

export const levantarLegacy = () => levantar(crearAppLegacy());

export const levantarRefactor = (datos = { equipos: [], partidos: [] }) =>
  levantar(crearApp(crearServicios({ datos })));
