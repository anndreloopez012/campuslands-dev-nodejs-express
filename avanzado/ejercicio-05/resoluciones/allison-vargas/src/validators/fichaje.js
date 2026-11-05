import { PASOS_FICHAJE, PASOS_INTERCAMBIO, PRECIO_MAXIMO, SALARIO_MAXIMO } from '../constants/futbol.js';
import {
  esObjetoPlano,
  exigirCuerpo,
  leerEntero,
  leerOpcion,
  rechazarSobrantes,
  terminar,
} from './comunes.js';

export function validarFichaje(cuerpo, { permitirFallos }) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['jugadorId', 'clubDestinoId', 'precio', 'salario', 'simularFalloEn'], errores);
  const datos = {
    jugadorId: leerEntero(cuerpo, 'jugadorId', errores, { min: 1 }),
    clubDestinoId: leerEntero(cuerpo, 'clubDestinoId', errores, { min: 1 }),
    precio: leerEntero(cuerpo, 'precio', errores, { min: 1, max: PRECIO_MAXIMO }),
  };
  const salario = leerEntero(cuerpo, 'salario', errores, { min: 1, max: SALARIO_MAXIMO, requerido: false });
  if (salario !== undefined) datos.salario = salario;
  const falloEn = validarFallo(cuerpo, PASOS_FICHAJE, errores, permitirFallos);
  if (falloEn) datos.simularFalloEn = falloEn;
  return terminar(errores, datos);
}

export function validarIntercambio(cuerpo, { permitirFallos }) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['jugadorAId', 'jugadorBId', 'compensacion', 'simularFalloEn'], errores);
  const datos = {
    jugadorAId: leerEntero(cuerpo, 'jugadorAId', errores, { min: 1 }),
    jugadorBId: leerEntero(cuerpo, 'jugadorBId', errores, { min: 1 }),
  };
  if (!errores.length && datos.jugadorAId === datos.jugadorBId) {
    errores.push({ campo: 'jugadorBId', mensaje: 'debe ser distinto de jugadorAId' });
  }
  if (cuerpo.compensacion !== undefined) {
    if (!esObjetoPlano(cuerpo.compensacion)) {
      errores.push({ campo: 'compensacion', mensaje: 'debe ser un objeto' });
    } else {
      rechazarSobrantes(cuerpo.compensacion, ['pagaClubId', 'monto'], errores, 'compensacion');
      datos.compensacion = {
        pagaClubId: leerEntero(cuerpo.compensacion, 'pagaClubId', errores, { min: 1, prefijo: 'compensacion' }),
        monto: leerEntero(cuerpo.compensacion, 'monto', errores, { min: 1, max: PRECIO_MAXIMO, prefijo: 'compensacion' }),
      };
    }
  }
  const falloEn = validarFallo(cuerpo, PASOS_INTERCAMBIO, errores, permitirFallos);
  if (falloEn) datos.simularFalloEn = falloEn;
  return terminar(errores, datos);
}

function validarFallo(cuerpo, pasos, errores, permitirFallos) {
  if (cuerpo.simularFalloEn === undefined) return undefined;
  if (!permitirFallos) {
    errores.push({ campo: 'simularFalloEn', mensaje: 'la simulacion de fallos esta deshabilitada' });
    return undefined;
  }
  return leerOpcion(cuerpo, 'simularFalloEn', pasos, errores);
}

export function leerClaveDeIdempotencia(valor) {
  if (valor === undefined) return undefined;
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(valor)) {
    return terminar([{ campo: 'Idempotency-Key', mensaje: 'debe tener de 8 a 64 caracteres: letras, numeros, guion o guion bajo' }]);
  }
  return valor;
}
