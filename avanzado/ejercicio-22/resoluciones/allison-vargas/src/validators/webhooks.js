import {
  exigirCuerpo, leerOpcion, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

export const TIPOS_EVENTO = Object.freeze(['proyecto.creado', 'plano.publicado', 'proyecto.aprobado']);
export const TIPOS_PROYECTO = Object.freeze(['vivienda', 'oficina', 'museo', 'escuela']);

const HOSTS_PRIVADOS = /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.|169\.254\.|\[::1\]|0\.0\.0\.0)/;

export function validarUrl(texto, { permitirLocal }) {
  let url;
  try {
    url = new URL(texto);
  } catch {
    return 'no es una url valida';
  }
  if (!['http:', 'https:'].includes(url.protocol)) return 'solo se aceptan http y https';
  if (url.username || url.password) return 'la url no puede llevar credenciales';
  // evita que la API se use para llamar servicios internos (SSRF), salvo en modo demostracion
  if (!permitirLocal && HOSTS_PRIVADOS.test(url.hostname)) return 'no se permiten direcciones internas';
  if (!permitirLocal && url.protocol !== 'https:') return 'en produccion solo se acepta https';
  return null;
}

export function validarSuscripcion(cuerpo, { permitirLocal }) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['url', 'eventos', 'descripcion'], errores);
  const url = leerTexto(cuerpo, 'url', errores, { max: 300 });
  if (url) {
    const problema = validarUrl(url, { permitirLocal });
    if (problema) errores.push({ campo: 'url', mensaje: problema });
  }
  const eventos = cuerpo.eventos;
  if (!Array.isArray(eventos) || eventos.length === 0 || eventos.some((e) => e !== '*' && !TIPOS_EVENTO.includes(e))) {
    errores.push({ campo: 'eventos', mensaje: `lista con "*" o de: ${TIPOS_EVENTO.join(', ')}` });
  }
  const datos = { url, eventos: [...new Set(eventos ?? [])] };
  if (cuerpo.descripcion !== undefined) datos.descripcion = leerTexto(cuerpo, 'descripcion', errores, { max: 100 });
  return terminar(errores, datos);
}

export function validarProyecto(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['nombre', 'cliente', 'tipo'], errores);
  return terminar(errores, {
    nombre: leerTexto(cuerpo, 'nombre', errores, { min: 3, max: 80 }),
    cliente: leerTexto(cuerpo, 'cliente', errores, { min: 3, max: 80 }),
    tipo: leerOpcion(cuerpo, 'tipo', TIPOS_PROYECTO, errores),
  });
}

export function validarPlano(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['nombre', 'nivel'], errores);
  const datos = { nombre: leerTexto(cuerpo, 'nombre', errores, { min: 3, max: 60 }), nivel: cuerpo.nivel };
  if (!Number.isInteger(cuerpo.nivel) || cuerpo.nivel < -5 || cuerpo.nivel > 120) errores.push({ campo: 'nivel', mensaje: 'debe ser un entero entre -5 y 120' });
  return terminar(errores, datos);
}

export function validarConfigReceptor(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['secretos', 'fallarProximos', 'responderGone'], errores);
  if (cuerpo.secretos !== undefined && (!Array.isArray(cuerpo.secretos) || cuerpo.secretos.some((s) => typeof s !== 'string' || !s.startsWith('whsec_')))) {
    errores.push({ campo: 'secretos', mensaje: 'debe ser una lista de secretos whsec_' });
  }
  if (cuerpo.fallarProximos !== undefined && (!Number.isInteger(cuerpo.fallarProximos) || cuerpo.fallarProximos < 0 || cuerpo.fallarProximos > 10)) {
    errores.push({ campo: 'fallarProximos', mensaje: 'debe ser un entero entre 0 y 10' });
  }
  if (cuerpo.responderGone !== undefined && typeof cuerpo.responderGone !== 'boolean') errores.push({ campo: 'responderGone', mensaje: 'debe ser booleano' });
  return terminar(errores, cuerpo);
}
