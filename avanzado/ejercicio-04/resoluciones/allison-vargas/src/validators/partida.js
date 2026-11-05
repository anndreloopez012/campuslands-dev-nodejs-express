import { ESTADOS, PARTIDA } from '../constants/juego.js';
import {
  exigirCuerpo,
  leerEntero,
  leerOpcion,
  leerPaginacion,
  leerTexto,
  rechazarSobrantes,
  terminar,
} from './comunes.js';

export function validarPartidaNueva(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['nombre', 'capacidad', 'minimo'], errores);
  const nombre = leerTexto(cuerpo, 'nombre', errores, { min: PARTIDA.nombreMin, max: PARTIDA.nombreMax });
  const capacidad = leerEntero(cuerpo, 'capacidad', errores, {
    min: PARTIDA.capacidadMin,
    max: PARTIDA.capacidadMax,
    requerido: false,
    defecto: 10,
  });
  const minimo = leerEntero(cuerpo, 'minimo', errores, {
    min: PARTIDA.minimoPorDefecto,
    max: PARTIDA.capacidadMax,
    requerido: false,
    defecto: PARTIDA.minimoPorDefecto,
  });
  if (!errores.length && minimo > capacidad) {
    errores.push({ campo: 'minimo', mensaje: 'no puede superar la capacidad' });
  }
  return terminar(errores, { nombre, capacidad, minimo });
}

export function validarConsultaPartidas(consulta) {
  const errores = [];
  const estado = leerOpcion(consulta, 'estado', Object.values(ESTADOS), errores, { requerido: false });
  const paginacion = leerPaginacion(consulta, errores);
  return terminar(errores, { estado, ...paginacion });
}
