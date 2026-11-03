const ESTADOS_VALIDOS = ['pendiente', 'en_proceso', 'completada'];

export function validarOrden(datos = {}) {
  const errores = [];
  const { descripcion, estado, costo_estimado } = datos;

  if (typeof descripcion !== 'string' || descripcion.trim().length === 0) {
    errores.push('descripcion es obligatoria y debe ser un texto no vacio');
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    errores.push(`estado es obligatorio y debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  if (typeof costo_estimado !== 'number' || costo_estimado < 0) {
    errores.push('costo_estimado es obligatorio y debe ser un numero mayor o igual a 0');
  }

  return { valido: errores.length === 0, errores };
}

export function validarEstado(estado) {
  if (!ESTADOS_VALIDOS.includes(estado)) {
    return { valido: false, mensaje: `estado debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}` };
  }

  return { valido: true };
}
