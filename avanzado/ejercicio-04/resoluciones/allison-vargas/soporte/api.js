import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { AHORA, LOOT_FIJO, aparicionFija } from './datos.js';
import { levantar } from './cliente.js';

export const levantarApi = ({ registro = () => {}, ...opciones } = {}) =>
  levantar(crearApp({
    registro,
    servicios: crearServicios({
      reloj: () => AHORA,
      aparicion: aparicionFija,
      plantillaLoot: LOOT_FIJO,
      ...opciones,
    }),
  }));
