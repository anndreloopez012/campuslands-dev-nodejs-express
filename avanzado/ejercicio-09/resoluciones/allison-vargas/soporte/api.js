import http from 'node:http';
import { crearApp } from '../src/app.js';
import { crearEntorno } from './entorno.js';
import { levantar } from './cliente.js';

export async function levantarApi({ registro = () => {}, ...opciones } = {}) {
  const entorno = crearEntorno(opciones);
  const api = await levantar(crearApp({ servicios: entorno.servicios, registro }));
  return { ...api, ...entorno };
}

export function subir(origen, ruta, trozos, { tipo = 'application/x-ndjson', esperaMs = 0, abortar = false } = {}) {
  return new Promise((resolver, rechazar) => {
    const url = new URL(`${origen}${ruta}`);
    const peticion = http.request({
      hostname: url.hostname,
      port: url.port,
      path: `${url.pathname}${url.search}`,
      method: 'POST',
      headers: { 'content-type': tipo, 'transfer-encoding': 'chunked' },
    }, (respuesta) => {
      const partes = [];
      respuesta.on('data', (p) => partes.push(p));
      respuesta.on('end', () => {
        const texto = Buffer.concat(partes).toString('utf8');
        let cuerpo = texto;
        try {
          cuerpo = JSON.parse(texto);
        } catch {
          cuerpo = texto;
        }
        resolver({ status: respuesta.statusCode, cuerpo });
      });
    });
    peticion.on('error', (error) => {
      if (abortar) resolver({ status: null, cuerpo: null });
      else rechazar(error);
    });
    (async () => {
      for (const trozo of trozos) {
        peticion.write(trozo);
        if (esperaMs) await new Promise((r) => { setTimeout(r, esperaMs); });
      }
      if (abortar) peticion.destroy();
      else peticion.end();
    })();
  });
}
