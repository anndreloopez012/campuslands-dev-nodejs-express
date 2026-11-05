import {
  CAMPOS_BASE, CAMPOS_ORDENABLES, CLASIFICACIONES, COMPRESIONES, FORMAS, INCLUIBLES, LIMITES, SUBGENEROS,
} from '../constants/peliculas.js';
import { camposPorDefecto } from '../domain/proyeccion.js';
import {
  esObjetoPlano, leerEntero, leerOpcion, leerPaginacion, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

export function esFechaReal(texto) {
  if (typeof texto !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fecha = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().slice(0, 10) === texto;
}

const FILTROS = ['subgenero', 'desde', 'hasta', 'calificacionMin', 'clasificacion', 'directorId', 'actorId', 'q'];
const PARAMETROS_EXPORTACION = ['forma', 'pretty', 'campos', 'incluir', 'orden', 'limite', 'descargar', 'compresion', ...FILTROS];

function opcion(consulta, campo, opciones, errores, defecto) {
  const valor = consulta[campo];
  if (valor === undefined) return defecto;
  if (typeof valor !== 'string' || !opciones.includes(valor)) {
    errores.push({ campo, mensaje: `debe ser uno de: ${opciones.join(', ')}` });
    return defecto;
  }
  return valor;
}

const booleano = (consulta, campo, errores, defecto) => opcion(consulta, campo, ['true', 'false'], errores, defecto ? 'true' : 'false') === 'true';

function entero(consulta, campo, errores, { min, max }) {
  const valor = consulta[campo];
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || !/^\d{1,9}$/.test(valor) || Number(valor) < min || Number(valor) > max) {
    errores.push({ campo, mensaje: `debe ser un entero entre ${min} y ${max}` });
    return undefined;
  }
  return Number(valor);
}

function lista(consulta, campo, errores, permitidos) {
  const valor = consulta[campo];
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || valor.trim() === '') {
    errores.push({ campo, mensaje: 'debe ser una lista separada por comas' });
    return undefined;
  }
  const items = valor.split(',').map((i) => i.trim());
  const malos = items.filter((i) => !permitidos.includes(i));
  if (malos.length) errores.push({ campo, mensaje: `valores no permitidos: ${malos.join(', ')}; usa: ${permitidos.join(', ')}` });
  else if (new Set(items).size !== items.length) errores.push({ campo, mensaje: 'tiene valores repetidos' });
  else if (items.length > LIMITES.maxCampos) errores.push({ campo, mensaje: `admite como maximo ${LIMITES.maxCampos} valores` });
  return malos.length ? undefined : items;
}

function leerFiltros(consulta, errores) {
  const desde = entero(consulta, 'desde', errores, { min: 1900, max: 2100 });
  const hasta = entero(consulta, 'hasta', errores, { min: 1900, max: 2100 });
  if (desde && hasta && desde > hasta) errores.push({ campo: 'hasta', mensaje: 'no puede ser anterior a desde' });
  let calificacionMin;
  if (consulta.calificacionMin !== undefined) {
    const crudo = consulta.calificacionMin;
    if (typeof crudo === 'string' && /^(\d|10)(\.\d)?$/.test(crudo) && Number(crudo) <= 10) calificacionMin = Number(crudo);
    else errores.push({ campo: 'calificacionMin', mensaje: 'debe ser un numero de 0 a 10 con un decimal como maximo' });
  }
  let q;
  if (consulta.q !== undefined) {
    if (typeof consulta.q === 'string' && consulta.q.trim() !== '' && consulta.q.length <= 60) q = consulta.q.trim();
    else errores.push({ campo: 'q', mensaje: 'debe ser texto de 1 a 60 caracteres' });
  }
  return {
    subgenero: opcion(consulta, 'subgenero', SUBGENEROS, errores, undefined),
    clasificacion: opcion(consulta, 'clasificacion', CLASIFICACIONES, errores, undefined),
    desde,
    hasta,
    calificacionMin,
    directorId: entero(consulta, 'directorId', errores, { min: 1, max: 999999 }),
    actorId: entero(consulta, 'actorId', errores, { min: 1, max: 999999 }),
    q,
  };
}

function leerOrden(consulta, errores) {
  const crudo = consulta.orden;
  if (crudo === undefined) return { campo: 'id', direccion: 'asc' };
  const [campo, direccion = 'asc', ...resto] = typeof crudo === 'string' ? crudo.split(':') : [''];
  if (!CAMPOS_ORDENABLES.includes(campo) || !['asc', 'desc'].includes(direccion) || resto.length) {
    errores.push({ campo: 'orden', mensaje: `debe ser campo o campo:asc|desc con campo en: ${CAMPOS_ORDENABLES.join(', ')}` });
    return { campo: 'id', direccion: 'asc' };
  }
  return { campo, direccion };
}

export function leerExportacion(consulta, { conNombre = false } = {}) {
  const errores = [];
  rechazarSobrantes(consulta, conNombre ? [...PARAMETROS_EXPORTACION, 'nombre'] : PARAMETROS_EXPORTACION, errores);
  const forma = opcion(consulta, 'forma', FORMAS, errores, 'arreglo');
  const pretty = booleano(consulta, 'pretty', errores, false);
  if (pretty && forma === 'ndjson') errores.push({ campo: 'pretty', mensaje: 'no se puede combinar con forma=ndjson porque cada registro va en una sola linea' });
  const incluir = lista(consulta, 'incluir', errores, INCLUIBLES) ?? [];
  const permitidos = camposPorDefecto(incluir);
  const campos = lista(consulta, 'campos', errores, permitidos) ?? permitidos;
  const orden = leerOrden(consulta, errores);
  const limite = entero(consulta, 'limite', errores, { min: 1, max: LIMITES.maxRegistrosExportables });
  const filtros = leerFiltros(consulta, errores);
  const resultado = {
    forma, pretty, incluir, campos, orden, limite, filtros,
    descargar: booleano(consulta, 'descargar', errores, true),
    compresion: opcion(consulta, 'compresion', COMPRESIONES, errores, 'auto'),
  };
  if (conNombre) {
    const nombre = consulta.nombre;
    if (nombre !== undefined && (typeof nombre !== 'string' || nombre.trim() === '' || nombre.length > LIMITES.nombreInstantanea)) {
      errores.push({ campo: 'nombre', mensaje: `debe ser texto de 1 a ${LIMITES.nombreInstantanea} caracteres` });
    }
    resultado.nombre = typeof nombre === 'string' ? nombre.trim() : null;
  }
  return terminar(errores, resultado);
}

export function leerEsquema(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['campos', 'incluir'], errores);
  const incluir = lista(consulta, 'incluir', errores, INCLUIBLES) ?? [];
  const campos = lista(consulta, 'campos', errores, camposPorDefecto(incluir)) ?? camposPorDefecto(incluir);
  return terminar(errores, { campos });
}

export function leerListado(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['pagina', 'limite', 'orden', ...FILTROS], errores);
  const { pagina, limite } = leerPaginacion(consulta, errores);
  const orden = leerOrden(consulta, errores);
  const filtros = leerFiltros(consulta, errores);
  return terminar(errores, {
    pagina, limite, orden, filtros,
  });
}

export function leerPaginaSimple(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['pagina', 'limite'], errores);
  const { pagina, limite } = leerPaginacion(consulta, errores);
  return terminar(errores, { pagina, limite });
}

function leerNumeroNoNegativo(cuerpo, campo, errores, { max, decimales = 1 } = {}) {
  const valor = cuerpo[campo];
  if (valor === undefined || valor === null) {
    errores.push({ campo, mensaje: 'es obligatorio' });
    return undefined;
  }
  if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0 || (max !== undefined && valor > max)) {
    errores.push({ campo, mensaje: `debe ser un numero entre 0 y ${max ?? 'un valor razonable'}` });
    return undefined;
  }
  if (Math.round(valor * 10 ** decimales) / 10 ** decimales !== valor) {
    errores.push({ campo, mensaje: `admite como maximo ${decimales} decimal` });
  }
  return valor;
}

export function validarPelicula(cuerpo, { anioMaximo, catalogo }) {
  const errores = [];
  if (!esObjetoPlano(cuerpo)) throw terminar([{ campo: 'cuerpo', mensaje: 'debe ser un objeto' }]);
  rechazarSobrantes(cuerpo, Object.keys(CAMPOS_BASE).filter((c) => c !== 'id'), errores);
  const titulo = leerTexto(cuerpo, 'titulo', errores, { max: 120 });
  const anio = leerEntero(cuerpo, 'anio', errores, { min: 1920, max: anioMaximo });
  const subgenero = leerOpcion(cuerpo, 'subgenero', SUBGENEROS, errores);
  const duracionMin = leerEntero(cuerpo, 'duracionMin', errores, { min: 40, max: 300 });
  const clasificacion = leerOpcion(cuerpo, 'clasificacion', CLASIFICACIONES, errores);
  const calificacion = leerNumeroNoNegativo(cuerpo, 'calificacion', errores, { max: 10 });
  const presupuestoMusd = leerNumeroNoNegativo(cuerpo, 'presupuestoMusd', errores, { max: 1000 });
  const recaudacionMusd = leerNumeroNoNegativo(cuerpo, 'recaudacionMusd', errores, { max: 10000 });
  const pais = leerTexto(cuerpo, 'pais', errores, { min: 2, max: 40 });
  let estreno = cuerpo.estreno;
  if (estreno === undefined && anio !== undefined) estreno = `${anio}-01-01`;
  if (!esFechaReal(estreno)) errores.push({ campo: 'estreno', mensaje: 'debe ser una fecha real con formato AAAA-MM-DD' });
  else if (anio !== undefined && Number(estreno.slice(0, 4)) !== anio) errores.push({ campo: 'estreno', mensaje: 'debe caer en el anio de la pelicula' });
  let sinopsis = '';
  if (cuerpo.sinopsis !== undefined) sinopsis = leerTexto(cuerpo, 'sinopsis', errores, { max: 500 });
  let etiquetas = [];
  if (cuerpo.etiquetas !== undefined) {
    const valor = cuerpo.etiquetas;
    if (!Array.isArray(valor) || valor.length > 8 || valor.some((e) => typeof e !== 'string' || e.trim() === '' || e.length > 20)) {
      errores.push({ campo: 'etiquetas', mensaje: 'debe ser una lista de hasta 8 textos de 1 a 20 caracteres' });
    } else {
      etiquetas = [...new Set(valor.map((e) => e.trim().toLowerCase()))];
    }
  }
  const directorId = leerEntero(cuerpo, 'directorId', errores, { min: 1 });
  if (directorId !== undefined && !catalogo.director(directorId)) errores.push({ campo: 'directorId', mensaje: 'no existe ese director' });
  let repartoIds = [];
  const reparto = cuerpo.repartoIds;
  if (!Array.isArray(reparto) || reparto.length < 1 || reparto.length > 10 || reparto.some((id) => !Number.isInteger(id))) {
    errores.push({ campo: 'repartoIds', mensaje: 'debe ser una lista de 1 a 10 ids de actores' });
  } else if (new Set(reparto).size !== reparto.length) {
    errores.push({ campo: 'repartoIds', mensaje: 'tiene ids repetidos' });
  } else if (reparto.some((id) => !catalogo.actor(id))) {
    errores.push({ campo: 'repartoIds', mensaje: 'incluye actores que no existen' });
  } else {
    repartoIds = [...reparto];
  }
  terminar(errores);
  return {
    titulo, anio, subgenero, duracionMin, clasificacion, calificacion, presupuestoMusd, recaudacionMusd, estreno, pais, sinopsis, etiquetas, directorId, repartoIds,
  };
}
