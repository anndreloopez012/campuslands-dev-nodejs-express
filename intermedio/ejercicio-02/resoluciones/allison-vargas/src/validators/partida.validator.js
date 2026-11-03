export function validarPartida(body) {
  const errores = [];
  const mapa = typeof body?.mapa === 'string' ? body.mapa.trim() : '';
  const jugadores = body?.jugadores;

  if (!mapa) errores.push('mapa es obligatorio');
  if (!Array.isArray(jugadores) || jugadores.length < 2) {
    errores.push('jugadores debe ser un arreglo con al menos 2 ids');
  } else if (!jugadores.every((id) => Number.isInteger(id) && id > 0)) {
    errores.push('todos los ids de jugadores deben ser enteros positivos');
  } else if (new Set(jugadores).size !== jugadores.length) {
    errores.push('no se permiten jugadores repetidos');
  }

  return { valido: errores.length === 0, errores, datos: { mapa, jugadores } };
}
