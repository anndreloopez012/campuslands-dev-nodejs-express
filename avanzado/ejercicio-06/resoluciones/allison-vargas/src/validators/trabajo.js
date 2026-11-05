import {
  LISTA_DE_ESTADOS,
  LOTE_MAXIMO,
  MAX_DEPENDENCIAS,
  NOMBRES_DE_TIPO,
  RETRASO_MAXIMO_MS,
  AVANCE_MAXIMO_MS,
} from '../constants/taller.js';
import { validarCarga } from './carga.js';
import {
  exigirCuerpo,
  leerEntero,
  leerOpcion,
  leerPaginacion,
  leerTexto,
  rechazarSobrantes,
  terminar,
} from './comunes.js';

const enteroDeConsulta = (consulta, campo, errores, { min = 0, max = 99999 } = {}) => {
  const crudo = consulta[campo];
  if (crudo === undefined) return undefined;
  if (typeof crudo !== 'string' || !/^\d{1,5}$/.test(crudo) || Number(crudo) < min || Number(crudo) > max) {
    errores.push({ campo, mensaje: `debe ser un entero entre ${min} y ${max}` });
    return undefined;
  }
  return Number(crudo);
};

export function validarTrabajoNuevo(cuerpo, { permitirSimulaciones }) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['tipo', 'carga', 'prioridad', 'retrasoMs', 'maxIntentos', 'claveUnica', 'dependeDe'], errores);
  const tipo = leerOpcion(cuerpo, 'tipo', NOMBRES_DE_TIPO, errores);
  const datos = { tipo };
  if (tipo) datos.carga = validarCarga(tipo, cuerpo.carga ?? {}, errores, { donde: 'carga', permitirSimulaciones });
  const prioridad = leerEntero(cuerpo, 'prioridad', errores, { min: 0, max: 3, requerido: false });
  if (prioridad !== undefined) datos.prioridad = prioridad;
  const retraso = leerEntero(cuerpo, 'retrasoMs', errores, { min: 0, max: RETRASO_MAXIMO_MS, requerido: false });
  if (retraso !== undefined) datos.retrasoMs = retraso;
  const maxIntentos = leerEntero(cuerpo, 'maxIntentos', errores, { min: 1, max: 10, requerido: false });
  if (maxIntentos !== undefined) datos.maxIntentos = maxIntentos;
  if (cuerpo.claveUnica !== undefined) {
    datos.claveUnica = leerTexto(cuerpo, 'claveUnica', errores, {
      min: 3,
      max: 64,
      patron: /^[A-Za-z0-9_.:-]+$/,
      mensajePatron: 'solo admite letras, numeros y . _ : -',
    });
  }
  if (cuerpo.dependeDe !== undefined) datos.dependeDe = leerDependencias(cuerpo.dependeDe, errores);
  return terminar(errores, datos);
}

function leerDependencias(valor, errores) {
  if (!Array.isArray(valor)) {
    errores.push({ campo: 'dependeDe', mensaje: 'debe ser una lista' });
    return undefined;
  }
  if (valor.length > MAX_DEPENDENCIAS) {
    errores.push({ campo: 'dependeDe', mensaje: `admite como maximo ${MAX_DEPENDENCIAS} dependencias` });
    return undefined;
  }
  let valida = true;
  valor.forEach((id, i) => {
    if (!Number.isInteger(id) || id < 1) {
      errores.push({ campo: `dependeDe[${i}]`, mensaje: 'debe ser un entero positivo' });
      valida = false;
    }
  });
  if (valida && new Set(valor).size !== valor.length) {
    errores.push({ campo: 'dependeDe', mensaje: 'no puede repetir trabajos' });
    return undefined;
  }
  return valida ? [...valor] : undefined;
}

export function validarToken(cuerpo, extras = {}) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['token', ...Object.keys(extras)], errores);
  const token = leerTexto(cuerpo, 'token', errores, { min: 1, max: 64 });
  const datos = { token };
  for (const [campo, leer] of Object.entries(extras)) {
    const valor = leer(cuerpo, campo, errores);
    if (valor !== undefined) datos[campo] = valor;
  }
  return terminar(errores, datos);
}

export function validarFallo(cuerpo) {
  return validarToken(cuerpo, {
    mensaje: (origen, campo, errores) => {
      if (origen[campo] === undefined) return undefined;
      return leerTexto(origen, campo, errores, { min: 1, max: 200 });
    },
    definitivo: (origen, campo, errores) => {
      if (origen[campo] === undefined) return undefined;
      if (typeof origen[campo] !== 'boolean') {
        errores.push({ campo, mensaje: 'debe ser booleano' });
        return undefined;
      }
      return origen[campo];
    },
  });
}

export function validarResultado(cuerpo) {
  return validarToken(cuerpo, {
    resultado: (origen, campo, errores) => {
      if (origen[campo] === undefined) return undefined;
      if (origen[campo] === null || typeof origen[campo] !== 'object' || Array.isArray(origen[campo])) {
        errores.push({ campo, mensaje: 'debe ser un objeto' });
        return undefined;
      }
      return origen[campo];
    },
  });
}

export function validarReclamo(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['max'], errores);
  const max = leerEntero(cuerpo, 'max', errores, { min: 1, max: 5, requerido: false, defecto: 1 });
  return terminar(errores, { max });
}

export function validarProcesador(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['max'], errores);
  const max = leerEntero(cuerpo, 'max', errores, { min: 1, max: LOTE_MAXIMO, requerido: false, defecto: LOTE_MAXIMO });
  return terminar(errores, { max });
}

export function validarAvance(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['ms'], errores);
  const ms = leerEntero(cuerpo, 'ms', errores, { min: 1, max: AVANCE_MAXIMO_MS });
  return terminar(errores, { ms });
}

export function consultaTrabajos(consulta) {
  const errores = [];
  const estado = leerOpcion(consulta, 'estado', LISTA_DE_ESTADOS, errores, { requerido: false });
  const tipo = leerOpcion(consulta, 'tipo', NOMBRES_DE_TIPO, errores, { requerido: false });
  const ordenId = enteroDeConsulta(consulta, 'ordenId', errores, { min: 1 });
  const prioridad = enteroDeConsulta(consulta, 'prioridad', errores, { min: 0, max: 3 });
  const paginacion = leerPaginacion(consulta, errores);
  return terminar(errores, { estado, tipo, ordenId, prioridad, ...paginacion });
}

export function consultaOrdenes(consulta) {
  const errores = [];
  return terminar(errores, leerPaginacion(consulta, errores));
}
