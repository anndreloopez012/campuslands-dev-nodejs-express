import { crearApp, crearServicios } from '../src/app.js';
import { levantar } from './cliente.js';

export const INICIO = new Date('2026-11-05T12:00:00.000Z');

export async function levantarApi() {
  const servicios = crearServicios({ reloj: () => INICIO });
  const api = await levantar(crearApp({ servicios, registro: () => {} }));
  const cabecera = (quien) => ({ authorization: `Bearer tk-${quien}` });
  return {
    ...api,
    servicios,
    como: (quien, ruta, opciones = {}) => api.pedir(ruta, { ...opciones, headers: { ...cabecera(quien), ...(opciones.headers ?? {}) } }),
    jsonComo: (quien, ruta, cuerpo, metodo = 'POST') => api.json(ruta, cuerpo, metodo, cabecera(quien)),
  };
}

export async function conApi(prueba) {
  const api = await levantarApi();
  try {
    await prueba(api);
  } finally {
    await api.cerrar();
  }
}
