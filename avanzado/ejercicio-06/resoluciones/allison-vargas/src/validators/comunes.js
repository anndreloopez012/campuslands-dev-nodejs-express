import { crear } from '../errores/index.js';

export const ruta = (prefijo, campo) => (prefijo ? `${prefijo}.${campo}` : campo);

export const esObjetoPlano = (valor) =>
  valor !== null && typeof valor === 'object' && !Array.isArray(valor);

export function terminar(errores, datos) {
  if (errores.length) {
    throw crear('VALIDACION', {}, { detalles: errores });
  }
  return datos;
}

export function exigirCuerpo(cuerpo, errores, prefijo = '') {
  if (esObjetoPlano(cuerpo)) return true;
  errores.push({ campo: prefijo || 'cuerpo', mensaje: 'debe ser un objeto' });
  return false;
}

export function rechazarSobrantes(origen, permitidos, errores, prefijo = '') {
  for (const clave of Object.keys(origen)) {
    if (!permitidos.includes(clave)) {
      errores.push({ campo: ruta(prefijo, clave), mensaje: 'campo no permitido' });
    }
  }
}

export function leerEntero(origen, campo, errores, { min, max, requerido = true, defecto, prefijo = '' } = {}) {
  const valor = origen[campo];
  const donde = ruta(prefijo, campo);
  if (valor === undefined || valor === null) {
    if (requerido) errores.push({ campo: donde, mensaje: 'es obligatorio' });
    return defecto;
  }
  if (!Number.isInteger(valor)) {
    errores.push({ campo: donde, mensaje: 'debe ser un entero' });
    return undefined;
  }
  if (min !== undefined && valor < min) errores.push({ campo: donde, mensaje: `debe ser al menos ${min}` });
  else if (max !== undefined && valor > max) errores.push({ campo: donde, mensaje: `debe ser como maximo ${max}` });
  return valor;
}

export function leerNumero(origen, campo, errores, { prefijo = '' } = {}) {
  const valor = origen[campo];
  const donde = ruta(prefijo, campo);
  if (valor === undefined || valor === null) {
    errores.push({ campo: donde, mensaje: 'es obligatorio' });
    return undefined;
  }
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    errores.push({ campo: donde, mensaje: 'debe ser un numero' });
    return undefined;
  }
  return valor;
}

export function leerTexto(origen, campo, errores, { min = 1, max, patron, mensajePatron, prefijo = '' } = {}) {
  const valor = origen[campo];
  const donde = ruta(prefijo, campo);
  if (valor === undefined || valor === null) {
    errores.push({ campo: donde, mensaje: 'es obligatorio' });
    return undefined;
  }
  if (typeof valor !== 'string') {
    errores.push({ campo: donde, mensaje: 'debe ser texto' });
    return undefined;
  }
  const limpio = valor.trim();
  if (limpio.length < min) errores.push({ campo: donde, mensaje: `debe tener al menos ${min} caracteres` });
  else if (max !== undefined && limpio.length > max) {
    errores.push({ campo: donde, mensaje: `debe tener como maximo ${max} caracteres` });
  } else if (patron && !patron.test(limpio)) errores.push({ campo: donde, mensaje: mensajePatron });
  return limpio;
}

export function leerOpcion(origen, campo, opciones, errores, { requerido = true, prefijo = '' } = {}) {
  const valor = origen[campo];
  const donde = ruta(prefijo, campo);
  if (valor === undefined || valor === null) {
    if (requerido) errores.push({ campo: donde, mensaje: 'es obligatorio' });
    return undefined;
  }
  if (!opciones.includes(valor)) {
    errores.push({ campo: donde, mensaje: `debe ser uno de: ${opciones.join(', ')}` });
    return undefined;
  }
  return valor;
}

export function leerId(texto, campo = 'id') {
  if (typeof texto === 'string' && /^[1-9]\d{0,8}$/.test(texto)) return Number(texto);
  return terminar([{ campo, mensaje: 'debe ser un entero positivo' }]);
}

export function leerPaginacion(consulta, errores) {
  const entero = (campo, defecto, min, max) => {
    const crudo = consulta[campo];
    if (crudo === undefined) return defecto;
    if (typeof crudo !== 'string' || !/^\d+$/.test(crudo)) {
      errores.push({ campo, mensaje: 'debe ser un entero' });
      return defecto;
    }
    const valor = Number(crudo);
    if (valor < min || valor > max) {
      errores.push({ campo, mensaje: `debe estar entre ${min} y ${max}` });
      return defecto;
    }
    return valor;
  };
  return { pagina: entero('pagina', 1, 1, 100000), limite: entero('limite', 10, 1, 50) };
}

export function leerFiltroTexto(consulta, campo, errores, { max = 40 } = {}) {
  const crudo = consulta[campo];
  if (crudo === undefined) return undefined;
  if (typeof crudo !== 'string' || crudo.trim() === '' || crudo.length > max) {
    errores.push({ campo, mensaje: `debe ser texto de 1 a ${max} caracteres` });
    return undefined;
  }
  return crudo.trim();
}
