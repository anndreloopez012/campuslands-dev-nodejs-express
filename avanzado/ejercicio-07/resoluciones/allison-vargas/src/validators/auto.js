import {
  ANIO_MAXIMO,
  ANIO_MINIMO,
  CATEGORIAS,
  LISTA_DE_MONEDAS,
  LISTA_DE_ORDENES,
  PLAZOS,
  PRECIO_MAXIMO,
  PRECIO_MINIMO,
} from '../constants/autos.js';
import { AVANCE_MAXIMO_MS } from '../constants/cache.js';
import { crear } from '../errores/index.js';
import {
  exigirCuerpo,
  leerEntero,
  leerFiltroTexto,
  leerOpcion,
  leerPaginacion,
  leerTexto,
  rechazarSobrantes,
  terminar,
} from './comunes.js';

const CAMPOS = ['marca', 'modelo', 'anio', 'categoria', 'precioUsd', 'potenciaHp', 'vin', 'disponible'];
const VIN = /^[A-HJ-NPR-Z0-9]{17}$/;

function leerCampos(cuerpo, errores, { parcial }) {
  const datos = {};
  const requerido = !parcial;
  const presente = (campo) => cuerpo[campo] !== undefined;
  const con = (campo, leer) => {
    if (parcial && !presente(campo)) return;
    const valor = leer();
    if (valor !== undefined) datos[campo] = valor;
  };
  con('marca', () => leerTexto(cuerpo, 'marca', errores, { min: 2, max: 30 }));
  con('modelo', () => leerTexto(cuerpo, 'modelo', errores, { min: 1, max: 40 }));
  con('anio', () => leerEntero(cuerpo, 'anio', errores, { min: ANIO_MINIMO, max: ANIO_MAXIMO, requerido }));
  con('categoria', () => leerOpcion(cuerpo, 'categoria', CATEGORIAS, errores, { requerido }));
  con('precioUsd', () => leerEntero(cuerpo, 'precioUsd', errores, { min: PRECIO_MINIMO, max: PRECIO_MAXIMO, requerido }));
  con('potenciaHp', () => leerEntero(cuerpo, 'potenciaHp', errores, { min: 100, max: 3000, requerido }));
  con('vin', () => {
    const origen = typeof cuerpo.vin === 'string' ? { vin: cuerpo.vin.toUpperCase() } : cuerpo;
    return leerTexto(origen, 'vin', errores, { min: 17, max: 17, patron: VIN, mensajePatron: 'debe tener 17 letras y numeros (sin I, O ni Q)' });
  });
  if (presente('disponible')) {
    if (typeof cuerpo.disponible === 'boolean') datos.disponible = cuerpo.disponible;
    else errores.push({ campo: 'disponible', mensaje: 'debe ser booleano' });
  }
  return datos;
}

export function validarAutoNuevo(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, CAMPOS, errores);
  const datos = leerCampos(cuerpo, errores, { parcial: false });
  return terminar(errores, datos);
}

export function validarCambios(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, CAMPOS, errores);
  const datos = leerCampos(cuerpo, errores, { parcial: true });
  if (Object.keys(cuerpo).length === 0) errores.push({ campo: 'cuerpo', mensaje: 'debe incluir al menos un campo' });
  return terminar(errores, datos);
}

const precioDeConsulta = (consulta, campo, errores) => {
  const crudo = consulta[campo];
  if (crudo === undefined) return undefined;
  if (typeof crudo !== 'string' || !/^\d{1,8}$/.test(crudo)) {
    errores.push({ campo, mensaje: 'debe ser un entero' });
    return undefined;
  }
  return Number(crudo);
};

export function consultaAutos(consulta) {
  const errores = [];
  const marca = leerFiltroTexto(consulta, 'marca', errores, { max: 30 });
  const categoria = leerOpcion(consulta, 'categoria', CATEGORIAS, errores, { requerido: false });
  const minimo = precioDeConsulta(consulta, 'minimo', errores);
  const maximo = precioDeConsulta(consulta, 'maximo', errores);
  if (minimo !== undefined && maximo !== undefined && minimo > maximo) {
    errores.push({ campo: 'minimo', mensaje: 'no puede ser mayor que maximo' });
  }
  let disponible;
  if (consulta.disponible !== undefined) {
    if (consulta.disponible === 'true' || consulta.disponible === 'false') disponible = consulta.disponible === 'true';
    else errores.push({ campo: 'disponible', mensaje: 'debe ser true o false' });
  }
  const orden = leerOpcion(consulta, 'orden', LISTA_DE_ORDENES, errores, { requerido: false }) ?? 'id';
  const paginacion = leerPaginacion(consulta, errores);
  return terminar(errores, { marca: marca?.toLowerCase(), categoria, minimo, maximo, disponible, orden, ...paginacion });
}

export function consultaCotizacion(consulta) {
  const errores = [];
  const enteroOpcional = (campo, defecto, min, max) => {
    const crudo = consulta[campo];
    if (crudo === undefined) return defecto;
    if (typeof crudo !== 'string' || !/^\d{1,3}$/.test(crudo) || Number(crudo) < min || Number(crudo) > max) {
      errores.push({ campo, mensaje: `debe ser un entero entre ${min} y ${max}` });
      return defecto;
    }
    return Number(crudo);
  };
  const moneda = leerOpcion(consulta, 'moneda', LISTA_DE_MONEDAS, errores, { requerido: false }) ?? 'USD';
  const anticipoPorcentaje = enteroOpcional('anticipo', 20, 0, 90);
  const meses = enteroOpcional('meses', 36, PLAZOS[0], PLAZOS.at(-1));
  if (consulta.meses !== undefined && !PLAZOS.includes(meses)) {
    errores.push({ campo: 'meses', mensaje: `debe ser uno de: ${PLAZOS.join(', ')}` });
  }
  return terminar(errores, { moneda, anticipoPorcentaje, meses });
}

export function validarMarca(texto) {
  if (typeof texto !== 'string' || texto.trim() === '' || texto.length > 30) {
    throw crear('VALIDACION', {}, { detalles: [{ campo: 'marca', mensaje: 'debe ser texto de 1 a 30 caracteres' }] });
  }
  return texto.trim();
}

export function validarClave(texto, campo = 'clave') {
  if (typeof texto !== 'string' || texto.length < 1 || texto.length > 200 || !/^[\x21-\x7e]+$/.test(texto)) {
    throw crear('VALIDACION', {}, { detalles: [{ campo, mensaje: 'debe tener entre 1 y 200 caracteres imprimibles sin espacios' }] });
  }
  return texto;
}

export function consultaClaves(consulta) {
  const errores = [];
  const etiqueta = leerFiltroTexto(consulta, 'etiqueta', errores, { max: 80 });
  const prefijo = leerFiltroTexto(consulta, 'prefijo', errores, { max: 80 });
  return terminar(errores, { etiqueta, prefijo });
}

export function validarAvance(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['ms'], errores);
  const ms = leerEntero(cuerpo, 'ms', errores, { min: 1, max: AVANCE_MAXIMO_MS });
  return terminar(errores, { ms });
}
