const SOFTWARE_VALIDO = ['Blender', 'Maya', 'Cinema4D'];
const ESTADOS_VALIDOS = ['borrador', 'renderizando', 'completado'];

export function validarProyecto(datos = {}) {
  const errores = [];
  const { nombre, software, duracion_seg, estado } = datos;

  if (typeof nombre !== 'string' || nombre.trim().length === 0) {
    errores.push('nombre es obligatorio y debe ser un texto no vacio');
  }

  if (!SOFTWARE_VALIDO.includes(software)) {
    errores.push(`software es obligatorio y debe ser uno de: ${SOFTWARE_VALIDO.join(', ')}`);
  }

  if (typeof duracion_seg !== 'number' || duracion_seg <= 0) {
    errores.push('duracion_seg es obligatorio y debe ser un numero mayor a 0');
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    errores.push(`estado es obligatorio y debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  return { valido: errores.length === 0, errores };
}
