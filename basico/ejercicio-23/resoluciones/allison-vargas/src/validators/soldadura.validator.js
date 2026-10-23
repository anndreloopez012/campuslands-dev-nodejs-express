const TIPOS_VALIDOS = ['MIG', 'TIG', 'arco', 'electrodo'];
const ESTADOS_VALIDOS = ['pendiente', 'en_proceso', 'completada'];

export function validarSoldadura(datos = {}) {
  const errores = [];
  const { tipo_soldadura, material, estado } = datos;

  if (!TIPOS_VALIDOS.includes(tipo_soldadura)) {
    errores.push(`tipo_soldadura es obligatorio y debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`);
  }

  if (typeof material !== 'string' || material.trim().length === 0) {
    errores.push('material es obligatorio y debe ser un texto no vacio');
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    errores.push(`estado es obligatorio y debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  return { valido: errores.length === 0, errores };
}
