import {
  exigirCuerpo, leerEntero, leerOpcion, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

export const TIPOS = Object.freeze(['retrato', 'personaje', 'fondo']);
export const RESOLUCIONES = Object.freeze(['2k', '4k']);
export const ESTADOS = Object.freeze(['pendiente_pago', 'pagada', 'en_progreso', 'entregada']);

export function validarComision(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['artistaId', 'tipo', 'descripcion', 'resolucion', 'urgente'], errores);
  const datos = {
    artistaId: leerEntero(cuerpo, 'artistaId', errores, { min: 1 }),
    tipo: leerOpcion(cuerpo, 'tipo', TIPOS, errores),
    descripcion: leerTexto(cuerpo, 'descripcion', errores, { min: 10, max: 500 }),
    resolucion: leerOpcion(cuerpo, 'resolucion', RESOLUCIONES, errores, { requerido: false }) ?? '2k',
    urgente: cuerpo.urgente ?? false,
  };
  if (typeof datos.urgente !== 'boolean') errores.push({ campo: 'urgente', mensaje: 'debe ser booleano' });
  return terminar(errores, datos);
}

export function validarPago(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['comisionId', 'monto'], errores);
  return terminar(errores, {
    comisionId: leerEntero(cuerpo, 'comisionId', errores, { min: 1 }),
    monto: leerEntero(cuerpo, 'monto', errores, { min: 1000, max: 10_000_000 }),
  });
}

export function validarEstado(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['estado'], errores);
  return terminar(errores, { estado: leerOpcion(cuerpo, 'estado', ESTADOS, errores) });
}
