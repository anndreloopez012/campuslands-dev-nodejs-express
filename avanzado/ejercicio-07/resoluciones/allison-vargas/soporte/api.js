import { crearApp } from '../src/app.js';
import { crearEntorno } from './entorno.js';
import { levantar } from './cliente.js';

export async function levantarApi({ registro = () => {}, ...opciones } = {}) {
  const entorno = crearEntorno(opciones);
  const api = await levantar(crearApp({ servicios: entorno.servicios, registro }));
  return { ...api, ...entorno };
}
