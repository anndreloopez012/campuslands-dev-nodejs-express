import { CATEGORIAS, FORMATOS, LIMITES, METODOS, MODOS } from '../constants/combates.js';
import {
  esObjetoPlano, leerEntero, leerOpcion, leerPaginacion, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

const CAMPOS_COMBATE = ['fecha', 'categoria', 'rojoId', 'azulId', 'ganadorId', 'metodo', 'rounds', 'golpesRojo', 'golpesAzul'];

export function esFechaReal(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

export function validarCombate(dato, peleadoresPorId) {
  const errores = [];
  if (!esObjetoPlano(dato)) return { errores: [{ campo: 'linea', mensaje: 'debe ser un objeto' }] };
  rechazarSobrantes(dato, CAMPOS_COMBATE, errores);

  const fecha = leerTexto(dato, 'fecha', errores, { min: 10, max: 10 });
  if (typeof fecha === 'string' && fecha.length === 10 && !esFechaReal(fecha)) {
    errores.push({ campo: 'fecha', mensaje: 'debe ser una fecha real con formato AAAA-MM-DD' });
  }
  const categoria = leerOpcion(dato, 'categoria', CATEGORIAS, errores);
  const rojoId = leerEntero(dato, 'rojoId', errores, { min: 1 });
  const azulId = leerEntero(dato, 'azulId', errores, { min: 1 });
  const metodo = leerOpcion(dato, 'metodo', METODOS, errores);
  const rounds = leerEntero(dato, 'rounds', errores, { min: 1, max: 5 });
  const golpesRojo = leerEntero(dato, 'golpesRojo', errores, { min: 0, max: 2000 });
  const golpesAzul = leerEntero(dato, 'golpesAzul', errores, { min: 0, max: 2000 });

  let ganadorId = dato.ganadorId;
  if (ganadorId !== null && ganadorId !== undefined) {
    ganadorId = leerEntero(dato, 'ganadorId', errores, { min: 1 });
  }

  const rojo = peleadoresPorId.get(rojoId);
  const azul = peleadoresPorId.get(azulId);
  if (rojoId !== undefined && !rojo) errores.push({ campo: 'rojoId', mensaje: 'no existe ese peleador' });
  if (azulId !== undefined && !azul) errores.push({ campo: 'azulId', mensaje: 'no existe ese peleador' });
  if (rojoId !== undefined && rojoId === azulId) errores.push({ campo: 'azulId', mensaje: 'no puede ser el mismo peleador que rojoId' });
  if (rojo && azul && rojo !== azul && (rojo.categoria !== azul.categoria || (categoria && rojo.categoria !== categoria))) {
    errores.push({ campo: 'categoria', mensaje: 'ambos peleadores deben pertenecer a la categoria del combate' });
  }
  if (metodo === 'empate') {
    if (ganadorId !== null && ganadorId !== undefined) errores.push({ campo: 'ganadorId', mensaje: 'un empate no tiene ganador' });
  } else if (metodo && (ganadorId === null || ganadorId === undefined)) {
    errores.push({ campo: 'ganadorId', mensaje: 'es obligatorio cuando no hay empate' });
  } else if (typeof ganadorId === 'number' && ganadorId !== rojoId && ganadorId !== azulId) {
    errores.push({ campo: 'ganadorId', mensaje: 'debe ser rojoId o azulId' });
  }

  if (errores.length) return { errores };
  return {
    valor: {
      fecha, categoria, rojoId, azulId, ganadorId: metodo === 'empate' ? null : ganadorId, metodo, rounds, golpesRojo, golpesAzul,
    },
  };
}

function leerFecha(consulta, campo, errores) {
  const crudo = consulta[campo];
  if (crudo === undefined) return undefined;
  if (!esFechaReal(crudo)) {
    errores.push({ campo, mensaje: 'debe ser una fecha real con formato AAAA-MM-DD' });
    return undefined;
  }
  return crudo;
}

function leerEnteroConsulta(consulta, campo, errores, { min, max }) {
  const crudo = consulta[campo];
  if (crudo === undefined) return undefined;
  if (typeof crudo !== 'string' || !/^\d{1,9}$/.test(crudo)) {
    errores.push({ campo, mensaje: 'debe ser un entero' });
    return undefined;
  }
  const valor = Number(crudo);
  if (valor < min || valor > max) {
    errores.push({ campo, mensaje: `debe estar entre ${min} y ${max}` });
    return undefined;
  }
  return valor;
}

function leerOpcionConsulta(consulta, campo, opciones, errores) {
  const crudo = consulta[campo];
  if (crudo === undefined) return undefined;
  if (typeof crudo !== 'string' || !opciones.includes(crudo)) {
    errores.push({ campo, mensaje: `debe ser uno de: ${opciones.join(', ')}` });
    return undefined;
  }
  return crudo;
}

export function leerFiltros(consulta, errores) {
  const filtros = {
    peleadorId: leerEnteroConsulta(consulta, 'peleadorId', errores, { min: 1, max: 999999999 }),
    categoria: leerOpcionConsulta(consulta, 'categoria', CATEGORIAS, errores),
    metodo: leerOpcionConsulta(consulta, 'metodo', METODOS, errores),
    desde: leerFecha(consulta, 'desde', errores),
    hasta: leerFecha(consulta, 'hasta', errores),
  };
  if (filtros.desde && filtros.hasta && filtros.desde > filtros.hasta) {
    errores.push({ campo: 'hasta', mensaje: 'no puede ser anterior a desde' });
  }
  return filtros;
}

const PERMITIDOS_LISTADO = ['pagina', 'limite', 'peleadorId', 'categoria', 'metodo', 'desde', 'hasta'];
const PERMITIDOS_EXPORTAR = ['formato', 'limite', 'peleadorId', 'categoria', 'metodo', 'desde', 'hasta'];
const PERMITIDOS_ESTADISTICAS = ['peleadorId', 'categoria', 'metodo', 'desde', 'hasta'];

export function leerListado(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, PERMITIDOS_LISTADO, errores);
  const { pagina, limite } = leerPaginacion(consulta, errores);
  const filtros = leerFiltros(consulta, errores);
  return terminar(errores, { pagina, limite, filtros });
}

export function leerExportacion(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, PERMITIDOS_EXPORTAR, errores);
  const formato = leerOpcionConsulta(consulta, 'formato', FORMATOS, errores) ?? 'ndjson';
  const limite = leerEnteroConsulta(consulta, 'limite', errores, { min: 1, max: LIMITES.exportacionMaxima });
  const filtros = leerFiltros(consulta, errores);
  return terminar(errores, { formato, limite: limite ?? LIMITES.exportacionMaxima, filtros });
}

export function leerEstadisticas(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, PERMITIDOS_ESTADISTICAS, errores);
  const filtros = leerFiltros(consulta, errores);
  return terminar(errores, { filtros });
}

export function leerImportacion(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['modo'], errores);
  const modo = leerOpcionConsulta(consulta, 'modo', MODOS, errores) ?? 'permisivo';
  return terminar(errores, { modo });
}
