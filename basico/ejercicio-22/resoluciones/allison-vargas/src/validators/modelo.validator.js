const MATERIALES_VALIDOS = ['concreto', 'madera', 'acero', 'vidrio'];

export function validarModelo(datos = {}) {
  const errores = [];
  const { nombre, area_m2, material } = datos;

  if (typeof nombre !== 'string' || nombre.trim().length === 0) {
    errores.push('nombre es obligatorio y debe ser un texto no vacio');
  }

  if (typeof area_m2 !== 'number' || area_m2 <= 0) {
    errores.push('area_m2 es obligatorio y debe ser un numero mayor a 0');
  }

  if (!MATERIALES_VALIDOS.includes(material)) {
    errores.push(`material es obligatorio y debe ser uno de: ${MATERIALES_VALIDOS.join(', ')}`);
  }

  return { valido: errores.length === 0, errores };
}
