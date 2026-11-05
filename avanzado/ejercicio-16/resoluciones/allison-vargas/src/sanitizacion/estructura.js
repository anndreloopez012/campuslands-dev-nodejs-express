import { crear } from '../errores/index.js';

const PROHIBIDAS = new Set(['__proto__', 'constructor', 'prototype']);

export const LIMITES = Object.freeze({
  profundidad: 4, clavesPorObjeto: 30, elementosPorLista: 50, largoTexto: 5000, largoClave: 40,
});

function revisar(valor, ruta, profundidad, limites, problemas) {
  if (typeof valor === 'string') {
    if (valor.length > limites.largoTexto) problemas.push({ campo: ruta, mensaje: `texto de mas de ${limites.largoTexto} caracteres` });
    return;
  }
  if (valor === null || typeof valor !== 'object') return;
  if (profundidad > limites.profundidad) {
    problemas.push({ campo: ruta, mensaje: `anidacion mayor a ${limites.profundidad} niveles` });
    return;
  }
  if (Array.isArray(valor)) {
    if (valor.length > limites.elementosPorLista) {
      problemas.push({ campo: ruta, mensaje: `lista de mas de ${limites.elementosPorLista} elementos` });
      return;
    }
    valor.forEach((item, i) => revisar(item, `${ruta}[${i}]`, profundidad + 1, limites, problemas));
    return;
  }
  const claves = Object.keys(valor);
  if (claves.length > limites.clavesPorObjeto) {
    problemas.push({ campo: ruta, mensaje: `objeto con mas de ${limites.clavesPorObjeto} claves` });
    return;
  }
  for (const clave of claves) {
    const donde = ruta ? `${ruta}.${clave}` : clave;
    if (PROHIBIDAS.has(clave)) problemas.push({ campo: donde, mensaje: 'clave prohibida (contaminacion de prototipo)' });
    else if (clave.startsWith('$')) problemas.push({ campo: donde, mensaje: 'clave con $ (operador de consulta)' });
    else if (clave.includes('.') || clave.length > limites.largoClave || !/^[\p{L}\p{N}_-]+$/u.test(clave)) {
      problemas.push({ campo: donde, mensaje: 'nombre de clave no permitido' });
    } else revisar(valor[clave], donde, profundidad + 1, limites, problemas);
  }
}

export function revisarEstructura(valor, limites = LIMITES) {
  const problemas = [];
  revisar(valor, '', 0, limites, problemas);
  return problemas.map((p) => ({ ...p, campo: p.campo || 'cuerpo' }));
}

export const bloquearEstructurasPeligrosas = (limites = LIMITES) => (req, res, next) => {
  const problemas = revisarEstructura(req.body, limites);
  if (problemas.length) return next(crear('ENTRADA_PELIGROSA', {}, { detalles: problemas }));
  return next();
};

// con el parser "simple" un parametro repetido llega como arreglo: ?talla=40&talla=41
export const unicoPorParametro = (permitidosMultiples = []) => (req, res, next) => {
  const errores = [];
  for (const [clave, valor] of Object.entries(req.query)) {
    if (Array.isArray(valor) && !permitidosMultiples.includes(clave)) {
      errores.push({ campo: clave, mensaje: 'parametro repetido' });
    }
  }
  if (errores.length) return next(crear('VALIDACION', {}, { detalles: errores }));
  return next();
};
