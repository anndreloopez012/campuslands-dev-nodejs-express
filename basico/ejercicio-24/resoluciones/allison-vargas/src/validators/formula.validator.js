const TIPOS_VALIDOS = ['organico', 'inorganico'];
const ESTADOS_VALIDOS = ['solido', 'liquido', 'gaseoso'];
const PATRON_FORMULA = /^[A-Za-z0-9]+$/;

export function validarFormula(datos = {}) {
  const errores = [];
  const { nombre, formula, tipo, estado } = datos;

  if (typeof nombre !== 'string' || nombre.trim().length === 0) {
    errores.push('nombre es obligatorio y debe ser un texto no vacio');
  }

  if (typeof formula !== 'string' || !PATRON_FORMULA.test(formula)) {
    errores.push('formula es obligatoria y solo puede tener letras y numeros (ej: H2O, NaCl)');
  }

  if (!TIPOS_VALIDOS.includes(tipo)) {
    errores.push(`tipo es obligatorio y debe ser uno de: ${TIPOS_VALIDOS.join(', ')}`);
  }

  if (!ESTADOS_VALIDOS.includes(estado)) {
    errores.push(`estado es obligatorio y debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`);
  }

  return { valido: errores.length === 0, errores };
}
