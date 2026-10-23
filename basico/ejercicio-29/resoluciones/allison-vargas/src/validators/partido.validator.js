const MODALIDADES_VALIDAS = ['futbol', 'futbol_sala'];
const ESTADOS_VALIDOS = ['programado', 'en_curso', 'finalizado'];

export function validarPartido(datos = {}) {
  const errores = [];
  const { equipo_local, equipo_visitante, modalidad, estado } = datos;

  if (typeof equipo_local !== 'string' || equipo_local.trim().length === 0) {
    errores.push('equipo_local es obligatorio y debe ser un texto no vacio');
  }

  if (typeof equipo_visitante !== 'string' || equipo_visitante.trim().length === 0) {
    errores.push('equipo_visitante es obligatorio y debe ser un texto no vacio');
  }

  if (
    equipo_local &&
    equipo_visitante &&
    equipo_local.toLowerCase() === equipo_visitante.toLowerCase()
  ) {
    errores.push('equipo_local y equipo_visitante no pueden ser el mismo equipo');
  }

  if (!MODALIDADES_VALIDAS.includes(modalidad)) {
    errores.push(`modalidad es obligatoria y debe ser una de: ${MODALIDADES_VALIDAS.join(', ')}`);
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    errores.push(`estado es obligatorio y debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  return { valido: errores.length === 0, errores };
}
