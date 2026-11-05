import { crear } from '../errores/index.js';
import { COMPONENTES, EJES, SINTOMAS } from '../constants/taller.js';
import { esObjetoPlano, leerEntero, leerOpcion, rechazarSobrantes, ruta } from './comunes.js';

const CONTROL = ['fallosSimulados', 'colgar'];

const CAMPOS = {
  diagnostico: ['sintomas'],
  cambio_aceite: ['litros', 'sintetico'],
  frenos: ['eje'],
  afinacion: ['cilindrada'],
  electrica: ['componente'],
  lavado: [],
};

export function leerBooleano(origen, campo, errores, { prefijo = '', requerido = false } = {}) {
  const valor = origen[campo];
  if (valor === undefined || valor === null) {
    if (requerido) errores.push({ campo: ruta(prefijo, campo), mensaje: 'es obligatorio' });
    return undefined;
  }
  if (typeof valor !== 'boolean') {
    errores.push({ campo: ruta(prefijo, campo), mensaje: 'debe ser booleano' });
    return undefined;
  }
  return valor;
}

export function leerSintomas(origen, errores, prefijo = '') {
  const campo = ruta(prefijo, 'sintomas');
  const valor = origen.sintomas;
  if (!Array.isArray(valor)) {
    errores.push({ campo, mensaje: valor === undefined ? 'es obligatorio' : 'debe ser una lista' });
    return undefined;
  }
  if (valor.length < 1 || valor.length > 5) {
    errores.push({ campo, mensaje: 'debe tener entre 1 y 5 sintomas' });
    return undefined;
  }
  let valida = true;
  valor.forEach((sintoma, i) => {
    if (!SINTOMAS.includes(sintoma)) {
      errores.push({ campo: `${campo}[${i}]`, mensaje: `debe ser uno de: ${SINTOMAS.join(', ')}` });
      valida = false;
    }
  });
  if (valida && new Set(valor).size !== valor.length) {
    errores.push({ campo, mensaje: 'no puede repetir sintomas' });
    return undefined;
  }
  return valida ? [...valor] : undefined;
}

export function validarCarga(tipo, carga, errores, { donde, permitirSimulaciones }) {
  if (!esObjetoPlano(carga)) {
    errores.push({ campo: donde, mensaje: 'debe ser un objeto' });
    return undefined;
  }
  rechazarSobrantes(carga, [...CAMPOS[tipo], ...CONTROL], errores, donde);
  const datos = {};
  if (tipo === 'diagnostico') datos.sintomas = leerSintomas(carga, errores, donde);
  if (tipo === 'cambio_aceite') {
    datos.litros = leerEntero(carga, 'litros', errores, { min: 1, max: 4, prefijo: donde });
    const sintetico = leerBooleano(carga, 'sintetico', errores, { prefijo: donde });
    if (sintetico !== undefined) datos.sintetico = sintetico;
  }
  if (tipo === 'frenos') datos.eje = leerOpcion(carga, 'eje', EJES, errores, { prefijo: donde });
  if (tipo === 'afinacion') datos.cilindrada = leerEntero(carga, 'cilindrada', errores, { min: 50, max: 2000, prefijo: donde });
  if (tipo === 'electrica') datos.componente = leerOpcion(carga, 'componente', COMPONENTES, errores, { prefijo: donde });

  const fallos = leerEntero(carga, 'fallosSimulados', errores, { min: 0, max: 5, requerido: false, prefijo: donde });
  const colgar = leerBooleano(carga, 'colgar', errores, { prefijo: donde });
  if ((fallos !== undefined || colgar !== undefined) && !permitirSimulaciones) {
    throw crear('SIMULACION_DESHABILITADA', { campo: donde });
  }
  if (fallos !== undefined) datos.fallosSimulados = fallos;
  if (colgar !== undefined) datos.colgar = colgar;
  return datos;
}

