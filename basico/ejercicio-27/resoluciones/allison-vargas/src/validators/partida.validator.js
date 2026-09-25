const RESULTADOS_VALIDOS = ['equipo_a', 'equipo_b', 'en_curso'];

export function validarPartida(datos = {}) {
  const errores = [];
  const { equipo_a, equipo_b, duracion_min, resultado } = datos;

  if (typeof equipo_a !== 'string' || equipo_a.trim().length === 0) {
    errores.push('equipo_a es obligatorio y debe ser un texto no vacio');
  }

  if (typeof equipo_b !== 'string' || equipo_b.trim().length === 0) {
    errores.push('equipo_b es obligatorio y debe ser un texto no vacio');
  }

  if (equipo_a && equipo_b && equipo_a.toLowerCase() === equipo_b.toLowerCase()) {
    errores.push('equipo_a y equipo_b no pueden ser el mismo equipo');
  }

  if (typeof duracion_min !== 'number' || duracion_min <= 0) {
    errores.push('duracion_min es obligatorio y debe ser un numero mayor a 0');
  }

  if (!RESULTADOS_VALIDOS.includes(resultado)) {
    errores.push(`resultado es obligatorio y debe ser uno de: ${RESULTADOS_VALIDOS.join(', ')}`);
  }

  return { valido: errores.length === 0, errores };
}
