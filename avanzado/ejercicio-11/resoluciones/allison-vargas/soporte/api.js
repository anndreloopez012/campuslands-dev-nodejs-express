import { crearApp } from '../src/app.js';
import { crearEntorno } from './entorno.js';
import { levantar } from './cliente.js';

export async function levantarApi({ registro = () => {}, reloj, cederTurno } = {}) {
  const entorno = crearEntorno({ registro, reloj, cederTurno });
  const api = await levantar(crearApp({ servicios: entorno.servicios, registro }));
  const enviar = (ruta, cuerpo, { tipo = 'application/json', cabeceras = {} } = {}) => api.pedir(ruta, {
    method: 'POST',
    headers: tipo ? { 'content-type': tipo, ...cabeceras } : cabeceras,
    body: cuerpo,
  });
  return {
    ...api,
    ...entorno,
    enviar,
    importar: (canciones, consulta = '', cabeceras = {}) => enviar(
      `/importaciones${consulta}`,
      JSON.stringify({ canciones }),
      { cabeceras },
    ),
    accion: (ruta) => api.pedir(ruta, { method: 'POST' }),
  };
}
