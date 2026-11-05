import { JUGADOR } from '../constants/juego.js';
import {
  exigirCuerpo,
  leerFiltroTexto,
  leerPaginacion,
  leerTexto,
  rechazarSobrantes,
  terminar,
} from './comunes.js';

export function validarJugadorNuevo(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['nick'], errores);
  const nick = leerTexto(cuerpo, 'nick', errores, {
    min: JUGADOR.nickMin,
    max: JUGADOR.nickMax,
    patron: /^[A-Za-z0-9_]+$/,
    mensajePatron: 'solo admite letras, numeros y guion bajo',
  });
  return terminar(errores, { nick });
}

export function validarConsultaJugadores(consulta) {
  const errores = [];
  const buscar = leerFiltroTexto(consulta, 'buscar', errores);
  const paginacion = leerPaginacion(consulta, errores);
  return terminar(errores, { buscar, ...paginacion });
}
