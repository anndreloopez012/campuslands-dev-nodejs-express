// Antes de crear cualquier cosa con
// POST, se valida el body completo. peso_kg tiene un rango real
// (limite de seguridad del arnes/paracaidas en tandem), no es un
// numero arbitrario.

const NIVELES_VALIDOS = ['principiante', 'intermedio', 'avanzado'];
const PESO_MIN_KG = 40;
const PESO_MAX_KG = 120;

export function validarSalto(datos = {}) {
  const errores = [];
  const { nombre, peso_kg, nivel } = datos;

  if (typeof nombre !== 'string' || nombre.trim().length === 0) {
    errores.push('nombre es obligatorio y debe ser un texto no vacio');
  }

  if (typeof peso_kg !== 'number' || peso_kg < PESO_MIN_KG || peso_kg > PESO_MAX_KG) {
    errores.push(
      `peso_kg es obligatorio y debe estar entre ${PESO_MIN_KG} y ${PESO_MAX_KG} kg (limite de seguridad del equipo)`
    );
  }

  if (!NIVELES_VALIDOS.includes(nivel)) {
    errores.push(`nivel es obligatorio y debe ser uno de: ${NIVELES_VALIDOS.join(', ')}`);
  }

  return { valido: errores.length === 0, errores };
}
