import http from 'node:http';
import { gunzipSync } from 'node:zlib';
import { crearApp } from '../src/app.js';
import { crearEntorno } from './entorno.js';
import { levantar } from './cliente.js';

export async function levantarApi({ registro = () => {}, ...opciones } = {}) {
  const entorno = crearEntorno(opciones);
  const api = await levantar(crearApp({ servicios: entorno.servicios, registro }));

  function crudo(ruta, cabeceras = {}) {
    return new Promise((resolver, rechazar) => {
      http.get(`${api.origen}/avanzado/ejercicio-12${ruta}`, { headers: cabeceras }, (respuesta) => {
        const partes = [];
        respuesta.on('data', (p) => partes.push(p));
        respuesta.on('end', () => {
          const cuerpo = Buffer.concat(partes);
          resolver({ status: respuesta.statusCode, cabeceras: respuesta.headers, cuerpo, trozos: partes.length });
        });
      }).on('error', rechazar);
    });
  }

  return {
    ...api,
    ...entorno,
    crudo,
    async texto(ruta, cabeceras = {}) {
      const r = await crudo(ruta, cabeceras);
      const bytes = r.cabeceras['content-encoding'] === 'gzip' ? gunzipSync(r.cuerpo) : r.cuerpo;
      return { ...r, texto: bytes.toString('utf8') };
    },
    crear: (cuerpo) => api.json('/peliculas', cuerpo),
  };
}
