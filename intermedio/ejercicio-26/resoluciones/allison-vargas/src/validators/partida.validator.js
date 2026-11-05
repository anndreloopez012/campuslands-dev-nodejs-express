import { ValidationError } from '../utils/errors.js';
import { EQUIPOS, MAPAS, MODOS, NOMBRES_MODOS } from '../constants/shooter.js';

const CAMPOS = ['modo', 'mapa', 'equipoA', 'equipoB', 'ganador'];

function leerEquipo(campo, valor, tamano, errores) {
  if (!Array.isArray(valor)) {
    errores.push({ campo, mensaje: 'debe ser una lista de ids de jugadores' });
    return null;
  }
  if (valor.length !== tamano) {
    errores.push({ campo, mensaje: `debe tener exactamente ${tamano} jugador${tamano === 1 ? '' : 'es'}` });
    return null;
  }
  if (!valor.every((id) => Number.isInteger(id) && id > 0)) {
    errores.push({ campo, mensaje: 'todos los ids deben ser enteros positivos' });
    return null;
  }
  if (new Set(valor).size !== valor.length) {
    errores.push({ campo, mensaje: 'no puede repetir jugadores' });
    return null;
  }
  return valor;
}

export function validarPartida(body) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('El body debe ser un objeto JSON', undefined, 'BODY_INVALIDO');
  }

  const errores = [];
  for (const clave of Object.keys(body)) {
    if (!CAMPOS.includes(clave)) errores.push({ campo: clave, mensaje: 'campo no permitido' });
  }

  const { modo, mapa, equipoA, equipoB, ganador } = body;

  if (modo === undefined) errores.push({ campo: 'modo', mensaje: 'es obligatorio' });
  else if (!NOMBRES_MODOS.includes(modo)) errores.push({ campo: 'modo', mensaje: `debe ser uno de: ${NOMBRES_MODOS.join(', ')}` });

  if (mapa === undefined) errores.push({ campo: 'mapa', mensaje: 'es obligatorio' });
  else if (!MAPAS.includes(mapa)) errores.push({ campo: 'mapa', mensaje: `debe ser uno de: ${MAPAS.join(', ')}` });

  if (ganador === undefined) errores.push({ campo: 'ganador', mensaje: 'es obligatorio' });
  else if (!EQUIPOS.includes(ganador)) errores.push({ campo: 'ganador', mensaje: `debe ser uno de: ${EQUIPOS.join(', ')}` });

  let a = null;
  let b = null;
  if (equipoA === undefined) errores.push({ campo: 'equipoA', mensaje: 'es obligatorio' });
  if (equipoB === undefined) errores.push({ campo: 'equipoB', mensaje: 'es obligatorio' });

  if (Object.hasOwn(MODOS, modo)) {
    const tamano = MODOS[modo].porEquipo;
    if (equipoA !== undefined) a = leerEquipo('equipoA', equipoA, tamano, errores);
    if (equipoB !== undefined) b = leerEquipo('equipoB', equipoB, tamano, errores);
    if (a && b && a.some((id) => b.includes(id))) {
      errores.push({ campo: 'equipoB', mensaje: 'un jugador no puede estar en los dos equipos' });
    }
  }

  if (errores.length) throw new ValidationError('Datos invalidos', errores);
  return { modo, mapa, equipoA: a, equipoB: b, ganador };
}
