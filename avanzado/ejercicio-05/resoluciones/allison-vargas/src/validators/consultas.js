import { MODALIDADES } from '../constants/futbol.js';
import { leerFiltroTexto, leerOpcion, leerPaginacion, terminar } from './comunes.js';

const enteroDeConsulta = (consulta, campo, errores) => {
  const crudo = consulta[campo];
  if (crudo === undefined) return undefined;
  if (typeof crudo !== 'string' || !/^[1-9]\d{0,8}$/.test(crudo)) {
    errores.push({ campo, mensaje: 'debe ser un entero positivo' });
    return undefined;
  }
  return Number(crudo);
};

export function consultaClubes(consulta) {
  const errores = [];
  const modalidad = leerOpcion(consulta, 'modalidad', MODALIDADES, errores, { requerido: false });
  return terminar(errores, { modalidad, ...leerPaginacion(consulta, errores) });
}

export function consultaJugadores(consulta) {
  const errores = [];
  const clubId = enteroDeConsulta(consulta, 'clubId', errores);
  const modalidad = leerOpcion(consulta, 'modalidad', MODALIDADES, errores, { requerido: false });
  const buscar = leerFiltroTexto(consulta, 'buscar', errores);
  return terminar(errores, { clubId, modalidad, buscar, ...leerPaginacion(consulta, errores) });
}

export function consultaFichajes(consulta) {
  const errores = [];
  const clubId = enteroDeConsulta(consulta, 'clubId', errores);
  const tipo = leerOpcion(consulta, 'tipo', ['fichaje', 'intercambio'], errores, { requerido: false });
  return terminar(errores, { clubId, tipo, ...leerPaginacion(consulta, errores) });
}

export function consultaMovimientos(consulta) {
  const errores = [];
  const clubId = enteroDeConsulta(consulta, 'clubId', errores);
  const agenteId = enteroDeConsulta(consulta, 'agenteId', errores);
  const fichajeId = enteroDeConsulta(consulta, 'fichajeId', errores);
  return terminar(errores, { clubId, agenteId, fichajeId, ...leerPaginacion(consulta, errores) });
}

export function consultaTransacciones(consulta) {
  const errores = [];
  const estado = leerOpcion(
    consulta,
    'estado',
    ['confirmada', 'revertida', 'conflicto', 'simulada'],
    errores,
    { requerido: false },
  );
  const nombre = leerOpcion(
    consulta,
    'nombre',
    ['fichar', 'intercambiar', 'simular_fichar', 'simular_intercambiar'],
    errores,
    { requerido: false },
  );
  return terminar(errores, { estado, nombre });
}
