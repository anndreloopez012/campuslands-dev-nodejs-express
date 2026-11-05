import {
  exigirCuerpo, leerEntero, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

const PATRON_FECHA = /^\d{4}-\d{2}-\d{2}$/;
export const PATRON_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

export function validarLogin(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['email', 'contrasena'], errores);
  const email = leerTexto(cuerpo, 'email', errores, { max: 120 });
  if (typeof cuerpo.contrasena !== 'string' || cuerpo.contrasena.length === 0 || cuerpo.contrasena.length > 200) {
    errores.push({ campo: 'contrasena', mensaje: 'es obligatoria' });
  }
  return terminar(errores, { email: email?.toLowerCase(), contrasena: cuerpo.contrasena });
}

export function validarRefresh(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['refreshToken'], errores);
  if (typeof cuerpo.refreshToken !== 'string' || cuerpo.refreshToken.length > 200) {
    errores.push({ campo: 'refreshToken', mensaje: 'es obligatorio' });
  }
  return terminar(errores, { refreshToken: cuerpo.refreshToken });
}

export function validarReserva(cuerpo, hoy) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['destinoId', 'fecha', 'personas'], errores);
  const datos = {
    destinoId: leerEntero(cuerpo, 'destinoId', errores, { min: 1 }),
    fecha: leerTexto(cuerpo, 'fecha', errores, { patron: PATRON_FECHA, mensajePatron: 'debe tener formato AAAA-MM-DD' }),
    personas: leerEntero(cuerpo, 'personas', errores, { min: 1, max: 8 }),
  };
  if (datos.fecha && PATRON_FECHA.test(datos.fecha)) {
    const fecha = new Date(`${datos.fecha}T00:00:00Z`);
    if (Number.isNaN(fecha.getTime()) || fecha.toISOString().slice(0, 10) !== datos.fecha) {
      errores.push({ campo: 'fecha', mensaje: 'no es una fecha real' });
    } else if (datos.fecha <= hoy) errores.push({ campo: 'fecha', mensaje: 'debe ser posterior a hoy' });
  }
  return terminar(errores, datos);
}

export function leerUuid(texto, campo = 'id') {
  if (typeof texto === 'string' && PATRON_UUID.test(texto)) return texto;
  return terminar([{ campo, mensaje: 'debe ser un uuid' }]);
}
