import {
  exigirCuerpo, leerEntero, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

const PATRON_LECTOR = /^[\p{L} .'-]+$/u;

export function validarPrestamo(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['libroId', 'lector'], errores);
  const datos = {
    libroId: leerEntero(cuerpo, 'libroId', errores, { min: 1 }),
    lector: leerTexto(cuerpo, 'lector', errores, {
      min: 3, max: 60, patron: PATRON_LECTOR, mensajePatron: 'solo puede tener letras, espacios, puntos y guiones',
    }),
  };
  if (datos.lector) datos.lector = datos.lector.replace(/\s+/g, ' ');
  return terminar(errores, datos);
}

export function leerFiltroTexto(consulta, campo, opciones) {
  const valor = consulta[campo];
  if (valor === undefined) return undefined;
  if (typeof valor !== 'string' || !opciones.includes(valor)) {
    return terminar([{ campo, mensaje: `debe ser uno de: ${opciones.join(', ')}` }]);
  }
  return valor;
}
