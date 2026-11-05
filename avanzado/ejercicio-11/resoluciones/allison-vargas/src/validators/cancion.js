import {
  CONFLICTOS, FORMATOS_RECHAZOS, GENEROS, LIMITES, MODOS,
} from '../constants/musica.js';
import {
  esObjetoPlano, leerEntero, leerPaginacion, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

const CAMPOS = ['isrc', 'titulo', 'artista', 'album', 'anio', 'duracionSeg', 'genero', 'explicito'];

export function normalizarIsrc(valor) {
  return typeof valor === 'string' ? valor.replace(/[-\s]/g, '').toUpperCase() : valor;
}

export const esIsrc = (valor) => typeof valor === 'string' && /^[A-Z]{2}[A-Z0-9]{3}[0-9]{7}$/.test(valor);

export function validarCancion(dato, { anioMaximo }) {
  if (!esObjetoPlano(dato)) return { errores: [{ campo: 'fila', mensaje: 'debe ser un objeto' }] };
  const errores = [];
  rechazarSobrantes(dato, CAMPOS, errores);

  const isrc = normalizarIsrc(dato.isrc);
  if (dato.isrc === undefined || dato.isrc === null) errores.push({ campo: 'isrc', mensaje: 'es obligatorio' });
  else if (!esIsrc(isrc)) errores.push({ campo: 'isrc', mensaje: 'debe tener 12 caracteres: 2 letras de pais, 3 de registrante y 7 digitos' });

  const titulo = leerTexto(dato, 'titulo', errores, { max: 120 });
  const artista = leerTexto(dato, 'artista', errores, { max: 80 });

  let album = null;
  if (dato.album !== undefined && dato.album !== null) album = leerTexto(dato, 'album', errores, { max: 80 });

  const anio = leerEntero(dato, 'anio', errores, { min: 1900, max: anioMaximo });
  const duracionSeg = leerEntero(dato, 'duracionSeg', errores, { min: 10, max: 3600 });

  const genero = typeof dato.genero === 'string' ? dato.genero.trim().toLowerCase() : dato.genero;
  if (genero === undefined || genero === null) errores.push({ campo: 'genero', mensaje: 'es obligatorio' });
  else if (!GENEROS.includes(genero)) errores.push({ campo: 'genero', mensaje: `debe ser uno de: ${GENEROS.join(', ')}` });

  let explicito = false;
  if (dato.explicito !== undefined && dato.explicito !== null) {
    if (typeof dato.explicito === 'boolean') explicito = dato.explicito;
    else errores.push({ campo: 'explicito', mensaje: 'debe ser verdadero o falso' });
  }

  if (errores.length) return { errores };
  return {
    valor: {
      isrc, titulo, artista, album, anio, duracionSeg, genero, explicito,
    },
  };
}

function leerOpcion(consulta, campo, opciones, errores, defecto) {
  const valor = consulta[campo];
  if (valor === undefined) return defecto;
  if (typeof valor !== 'string' || !opciones.includes(valor)) {
    errores.push({ campo, mensaje: `debe ser uno de: ${opciones.join(', ')}` });
    return defecto;
  }
  return valor;
}

function leerBooleano(consulta, campo, errores) {
  return leerOpcion(consulta, campo, ['true', 'false'], errores, 'false') === 'true';
}

function leerTextoConsulta(consulta, campo, errores, max = 80) {
  const valor = consulta[campo];
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || valor.trim() === '' || valor.length > max) {
    errores.push({ campo, mensaje: `debe ser texto de 1 a ${max} caracteres` });
    return undefined;
  }
  return valor.trim();
}

export function leerOpcionesImportacion(consulta, cabeceras) {
  const errores = [];
  rechazarSobrantes(consulta, ['modo', 'conflicto', 'tamanoLote', 'dryRun', 'esperar'], errores);
  const modo = leerOpcion(consulta, 'modo', MODOS, errores, 'permisivo');
  const conflicto = leerOpcion(consulta, 'conflicto', CONFLICTOS, errores, 'omitir');
  let tamanoLote = LIMITES.loteDefecto;
  if (consulta.tamanoLote !== undefined) {
    const crudo = consulta.tamanoLote;
    const valido = typeof crudo === 'string' && /^\d{1,4}$/.test(crudo)
      && Number(crudo) >= LIMITES.loteMinimo && Number(crudo) <= LIMITES.loteMaximo;
    if (valido) tamanoLote = Number(crudo);
    else errores.push({ campo: 'tamanoLote', mensaje: `debe ser un entero entre ${LIMITES.loteMinimo} y ${LIMITES.loteMaximo}` });
  }
  const dryRun = leerBooleano(consulta, 'dryRun', errores);
  const esperar = leerBooleano(consulta, 'esperar', errores);
  const clave = cabeceras['idempotency-key'];
  if (clave !== undefined && !/^[A-Za-z0-9_.:-]{1,80}$/.test(clave)) {
    errores.push({ campo: 'Idempotency-Key', mensaje: 'debe tener de 1 a 80 caracteres: letras, numeros, _ . : -' });
  }
  return terminar(errores, {
    opciones: {
      modo, conflicto, tamanoLote, dryRun,
    },
    esperar,
    clave: clave ?? null,
  });
}

export function leerListadoCanciones(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['pagina', 'limite', 'artista', 'genero', 'anio', 'q'], errores);
  const { pagina, limite } = leerPaginacion(consulta, errores);
  const artista = leerTextoConsulta(consulta, 'artista', errores);
  const q = leerTextoConsulta(consulta, 'q', errores);
  const genero = leerOpcion(consulta, 'genero', GENEROS, errores, undefined);
  let anio;
  if (consulta.anio !== undefined) {
    if (typeof consulta.anio === 'string' && /^\d{4}$/.test(consulta.anio)) anio = Number(consulta.anio);
    else errores.push({ campo: 'anio', mensaje: 'debe ser un anio de 4 digitos' });
  }
  return terminar(errores, {
    pagina, limite, filtros: { artista, genero, anio, q },
  });
}

export function leerPagina(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['pagina', 'limite'], errores);
  const { pagina, limite } = leerPaginacion(consulta, errores);
  return terminar(errores, { pagina, limite });
}

export function leerListadoImportaciones(consulta, estados) {
  const errores = [];
  rechazarSobrantes(consulta, ['pagina', 'limite', 'estado'], errores);
  const { pagina, limite } = leerPaginacion(consulta, errores);
  const estado = leerOpcion(consulta, 'estado', estados, errores, undefined);
  return terminar(errores, { pagina, limite, estado });
}

export function leerExportacionRechazos(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['formato'], errores);
  const formato = leerOpcion(consulta, 'formato', FORMATOS_RECHAZOS, errores, 'ndjson');
  return terminar(errores, { formato });
}

export function leerIsrcDeRuta(texto) {
  const isrc = normalizarIsrc(texto);
  if (esIsrc(isrc)) return isrc;
  return terminar([{ campo: 'isrc', mensaje: 'no tiene el formato de un ISRC' }]);
}
