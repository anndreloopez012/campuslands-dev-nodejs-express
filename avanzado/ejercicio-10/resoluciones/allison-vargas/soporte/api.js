import { crearApp } from '../src/app.js';
import { crearEntorno } from './entorno.js';
import { levantar } from './cliente.js';

export async function levantarApi({ registro = () => {}, ...opciones } = {}) {
  const entorno = crearEntorno(opciones);
  const api = await levantar(crearApp({ servicios: entorno.servicios, registro }));
  return {
    ...api,
    ...entorno,
    enviar: (ruta, cuerpo, { tipo = 'text/csv', metodo = 'POST' } = {}) => api.pedir(ruta, {
      method: metodo,
      headers: tipo ? { 'content-type': tipo } : {},
      body: cuerpo,
    }),
  };
}
