const RANGOS_VALIDOS = ['bronce', 'plata', 'oro', 'platino', 'diamante'];

export function validarJugador(datos = {}) {
  const errores = [];
  const { nombre, rango } = datos;

  if (typeof nombre !== 'string' || nombre.trim().length === 0) {
    errores.push('nombre es obligatorio y debe ser un texto no vacio');
  }

  if (!RANGOS_VALIDOS.includes(rango)) {
    errores.push(`rango es obligatorio y debe ser uno de: ${RANGOS_VALIDOS.join(', ')}`);
  }

  return { valido: errores.length === 0, errores };
}
