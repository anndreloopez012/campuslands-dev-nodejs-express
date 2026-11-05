import { ValidationError } from '../utils/errors.js';
import { calcularTabla } from '../domain/tabla.js';
import { MODALIDADES } from '../constants/futbol.js';

function leerModalidad(query) {
  const errores = [];
  for (const clave of Object.keys(query)) {
    if (clave !== 'modalidad') errores.push({ campo: clave, mensaje: 'parametro no permitido' });
  }
  const modalidad = query.modalidad;
  if (modalidad === undefined) {
    errores.push({ campo: 'modalidad', mensaje: 'es obligatoria' });
  } else if (typeof modalidad !== 'string' || !MODALIDADES.includes(modalidad)) {
    errores.push({ campo: 'modalidad', mensaje: `debe ser uno de: ${MODALIDADES.join(', ')}` });
  }
  if (errores.length) throw new ValidationError('Parametros de consulta invalidos', errores, 'CONSULTA_INVALIDA');
  return modalidad;
}

export function crearTablaService({ equipos, partidos }) {
  function obtener(query) {
    const modalidad = leerModalidad(query);
    return calcularTabla(equipos.todos(modalidad), partidos.todos());
  }

  return { obtener };
}
