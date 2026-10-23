const CLASES_VALIDAS = ['guerrero', 'mago', 'arquero', 'clerigo'];

export function validarPersonaje(datos = {}) {
  const errores = [];
  const { nombre, nivel, clase } = datos;

  if (typeof nombre !== 'string' || nombre.trim().length === 0) {
    errores.push('nombre es obligatorio y debe ser un texto no vacio');
  }

  if (typeof nivel !== 'number' || !Number.isInteger(nivel) || nivel < 1) {
    errores.push('nivel es obligatorio y debe ser un numero entero mayor o igual a 1');
  }

  if (!CLASES_VALIDAS.includes(clase)) {
    errores.push(`clase es obligatoria y debe ser una de: ${CLASES_VALIDAS.join(', ')}`);
  }

  return { valido: errores.length === 0, errores };
}
