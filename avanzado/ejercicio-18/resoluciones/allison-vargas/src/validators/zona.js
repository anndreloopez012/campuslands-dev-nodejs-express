import { TIPOS_SALTO } from '../autorizacion/politicas.js';
import {
  exigirCuerpo, leerEntero, leerOpcion, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

export function validarSalto(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['vueloId', 'tipo'], errores);
  return terminar(errores, {
    vueloId: leerEntero(cuerpo, 'vueloId', errores, { min: 1 }),
    tipo: leerOpcion(cuerpo, 'tipo', Object.keys(TIPOS_SALTO), errores),
  });
}

export function validarResolucion(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['decision', 'nota'], errores);
  const datos = { decision: leerOpcion(cuerpo, 'decision', ['aprobar', 'rechazar'], errores) };
  if (cuerpo.nota !== undefined) datos.nota = leerTexto(cuerpo, 'nota', errores, { max: 200 });
  return terminar(errores, datos);
}

export function validarVuelo(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['avion', 'pilotoId', 'hora', 'capacidad'], errores);
  const datos = {
    avion: leerTexto(cuerpo, 'avion', errores, { min: 3, max: 40 }),
    pilotoId: leerEntero(cuerpo, 'pilotoId', errores, { min: 1 }),
    hora: leerTexto(cuerpo, 'hora', errores, { max: 30 }),
    capacidad: leerEntero(cuerpo, 'capacidad', errores, { min: 1, max: 22 }),
  };
  if (datos.hora && Number.isNaN(Date.parse(datos.hora))) errores.push({ campo: 'hora', mensaje: 'debe ser una fecha ISO' });
  return terminar(errores, datos);
}

export function validarClima(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['suspendido', 'motivo'], errores);
  if (typeof cuerpo.suspendido !== 'boolean') errores.push({ campo: 'suspendido', mensaje: 'debe ser booleano' });
  const datos = { suspendido: cuerpo.suspendido, motivo: null };
  if (cuerpo.suspendido === true) datos.motivo = leerTexto(cuerpo, 'motivo', errores, { min: 3, max: 120 });
  return terminar(errores, datos);
}

export function validarConsulta(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['accion', 'saltoId', 'vueloId', 'tipo'], errores);
  const accion = leerTexto(cuerpo, 'accion', errores, { patron: /^[a-z_]+:[a-z_]+$/, mensajePatron: 'formato recurso:accion' });
  const datos = { accion };
  if (cuerpo.saltoId !== undefined) datos.saltoId = leerEntero(cuerpo, 'saltoId', errores, { min: 1 });
  if (cuerpo.vueloId !== undefined) datos.vueloId = leerEntero(cuerpo, 'vueloId', errores, { min: 1 });
  if (cuerpo.tipo !== undefined) datos.tipo = leerOpcion(cuerpo, 'tipo', Object.keys(TIPOS_SALTO), errores);
  return terminar(errores, datos);
}
