import { crearApp } from '../src/app.js';
import { crearServicios } from '../src/services/index.js';
import { levantar } from './cliente.js';

export const INICIO = new Date('2026-11-05T12:00:00.000Z');
export const SECRETO = 'secreto-de-pruebas-con-mas-de-32-caracteres';
export const MINUTO = 60 * 1000;
export const DIA = 24 * 60 * MINUTO;

export const CUENTAS = Object.freeze({
  valentina: { email: 'valentina@viajes.test', contrasena: 'Mochila2026!' },
  tomas: { email: 'tomas@viajes.test', contrasena: 'Patagonia#45' },
  admin: { email: 'admin@viajes.test', contrasena: 'Admin$Seguro9' },
});

export function crearReloj(inicio = INICIO) {
  let actual = inicio.getTime();
  return { reloj: () => new Date(actual), avanzar: (ms) => { actual += ms; } };
}

export async function levantarApi(opciones = {}) {
  const tiempo = crearReloj();
  const servicios = crearServicios({ reloj: tiempo.reloj, secreto: SECRETO, ...opciones });
  const api = await levantar(crearApp({ servicios, registro: () => {} }));
  const conToken = (token, extra = {}) => ({ ...extra, headers: { authorization: `Bearer ${token}`, ...(extra.headers ?? {}) } });
  return {
    ...api,
    ...tiempo,
    servicios,
    login: (cuenta, cabeceras) => api.json('/auth/login', CUENTAS[cuenta] ?? cuenta, 'POST', cabeceras),
    refrescar: (refreshToken) => api.json('/auth/refresh', { refreshToken }),
    comoUsuario: (token, ruta, opciones2 = {}) => api.pedir(ruta, conToken(token, opciones2)),
    jsonComo: (token, ruta, cuerpo, metodo = 'POST') => api.json(ruta, cuerpo, metodo, { authorization: `Bearer ${token}` }),
  };
}
