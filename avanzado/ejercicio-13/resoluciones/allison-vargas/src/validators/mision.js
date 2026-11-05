import { NOMBRES_NIVELES } from '../observabilidad/logger.js';
import { PATRON_REQUEST_ID } from '../middlewares/requestId.js';
import {
  exigirCuerpo, leerEntero, leerOpcion, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

export const PRIORIDADES = Object.freeze(['baja', 'media', 'alta']);
export const RESULTADOS = Object.freeze(['exito', 'fallo']);

function leerNumero(origen, campo, errores, { min, max }) {
  const valor = origen[campo];
  if (valor === undefined || valor === null) {
    errores.push({ campo, mensaje: 'es obligatorio' });
    return undefined;
  }
  if (typeof valor !== 'number' || !Number.isFinite(valor)) {
    errores.push({ campo, mensaje: 'debe ser un numero' });
    return undefined;
  }
  if (valor < min || valor > max) errores.push({ campo, mensaje: `debe estar entre ${min} y ${max}` });
  return valor;
}

export function validarMision(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['naveId', 'destino', 'objetivo', 'prioridad'], errores);
  const datos = {
    naveId: leerEntero(cuerpo, 'naveId', errores, { min: 1 }),
    destino: leerTexto(cuerpo, 'destino', errores, { min: 2, max: 80 }),
    objetivo: leerTexto(cuerpo, 'objetivo', errores, { min: 5, max: 200 }),
    prioridad: leerOpcion(cuerpo, 'prioridad', PRIORIDADES, errores, { requerido: false }) ?? 'media',
  };
  return terminar(errores, datos);
}

export function validarFinal(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['resultado', 'notas'], errores);
  const datos = { resultado: leerOpcion(cuerpo, 'resultado', RESULTADOS, errores) };
  if (cuerpo.notas !== undefined) datos.notas = leerTexto(cuerpo, 'notas', errores, { max: 300 });
  return terminar(errores, datos);
}

export function validarTelemetria(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['combustible', 'temperaturaC', 'velocidadKms'], errores);
  const datos = {
    combustible: leerNumero(cuerpo, 'combustible', errores, { min: 0, max: 100 }),
    temperaturaC: leerNumero(cuerpo, 'temperaturaC', errores, { min: -273, max: 5000 }),
    velocidadKms: leerNumero(cuerpo, 'velocidadKms', errores, { min: 0, max: 300000 }),
  };
  return terminar(errores, datos);
}

export function leerConsultaLogs(consulta) {
  const errores = [];
  rechazarSobrantes(consulta, ['nivel', 'requestId', 'mensaje', 'limite'], errores);
  const texto = (campo) => {
    const valor = consulta[campo];
    if (valor === undefined) return undefined;
    if (typeof valor !== 'string') {
      errores.push({ campo, mensaje: 'debe enviarse una sola vez' });
      return undefined;
    }
    return valor;
  };
  const nivel = texto('nivel');
  if (nivel !== undefined && !NOMBRES_NIVELES.includes(nivel)) {
    errores.push({ campo: 'nivel', mensaje: `debe ser uno de: ${NOMBRES_NIVELES.join(', ')}` });
  }
  const requestId = texto('requestId');
  if (requestId !== undefined && !PATRON_REQUEST_ID.test(requestId)) {
    errores.push({ campo: 'requestId', mensaje: 'formato invalido' });
  }
  const mensaje = texto('mensaje');
  if (mensaje !== undefined && (mensaje.length < 1 || mensaje.length > 80)) {
    errores.push({ campo: 'mensaje', mensaje: 'debe tener entre 1 y 80 caracteres' });
  }
  const limiteTexto = texto('limite');
  let limite = 50;
  if (limiteTexto !== undefined) {
    limite = /^\d{1,3}$/.test(limiteTexto) ? Number(limiteTexto) : 0;
    if (limite < 1 || limite > 200) errores.push({ campo: 'limite', mensaje: 'debe estar entre 1 y 200' });
  }
  return terminar(errores, {
    nivel, requestId, mensaje, limite,
  });
}

export function validarNivel(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['nivel'], errores);
  return terminar(errores, { nivel: leerOpcion(cuerpo, 'nivel', NOMBRES_NIVELES, errores) });
}
