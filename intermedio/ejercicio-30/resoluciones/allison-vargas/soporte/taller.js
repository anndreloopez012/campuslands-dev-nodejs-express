import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { levantar } from './cliente.js';

export const AHORA = new Date('2026-11-04T12:00:00.000Z');

export const CREDENCIALES = {
  admin: { usuario: 'admin', password: 'Admin2026' },
  lucia: { usuario: 'lucia', password: 'Recepcion2026' },
  carlos: { usuario: 'carlos', password: 'Taller2026' },
  marta: { usuario: 'marta', password: 'Taller2026' },
  pedro: { usuario: 'pedro', password: 'Taller2026' },
};

function sesion(cliente, token) {
  const pedir = (metodo) => (ruta, cuerpo) => cliente.pedir(ruta, {
    method: metodo,
    headers: {
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...(cuerpo === undefined ? {} : { 'content-type': 'application/json' }),
    },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
  });
  return {
    token,
    get: pedir('GET'),
    post: pedir('POST'),
    put: pedir('PUT'),
    patch: pedir('PATCH'),
    del: pedir('DELETE'),
  };
}

export async function levantarTaller(opciones = {}) {
  const reloj = opciones.reloj ?? (() => AHORA);
  const cliente = await levantar(crearApp(crearServicios({ reloj, ...opciones.servicios })));
  const abiertas = new Map();

  async function como(quien) {
    if (!abiertas.has(quien)) {
      const { cuerpo } = await cliente.json('/auth/login', CREDENCIALES[quien]);
      abiertas.set(quien, sesion(cliente, cuerpo.data.token));
    }
    return abiertas.get(quien);
  }

  return { cliente, como, anonimo: sesion(cliente, null), con: (token) => sesion(cliente, token), cerrar: () => cliente.cerrar() };
}
