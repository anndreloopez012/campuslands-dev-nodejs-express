const formulas = [
  { id: 1, nombre: 'Agua', formula: 'H2O', tipo: 'otro' },
  { id: 2, nombre: 'Acido clorhidrico', formula: 'HCl', tipo: 'acido' },
  { id: 3, nombre: 'Hidroxido de sodio', formula: 'NaOH', tipo: 'base' }
];

const tiposValidos = ['acido', 'base', 'sal', 'oxido', 'otro'];

export function getFormulas() {
  return formulas;
}

export function buscarFormula(id) {
  return formulas.find((f) => f.id === id);
}

export function validarFormula(datos) {
  const errores = [];

  if (typeof datos.nombre !== 'string' || datos.nombre.trim() === '') {
    errores.push('El nombre es obligatorio');
  }

  if (typeof datos.formula !== 'string' || datos.formula.trim() === '') {
    errores.push('La formula es obligatoria');
  }

  if (!tiposValidos.includes(datos.tipo)) {
    errores.push('El tipo debe ser acido, base, sal, oxido u otro');
  }

  return errores;
}

export function crearFormula(datos) {
  let nuevoId = 1;

  if (formulas.length > 0) {
    nuevoId = formulas[formulas.length - 1].id + 1;
  }

  const nueva = {
    id: nuevoId,
    nombre: datos.nombre.trim(),
    formula: datos.formula.trim(),
    tipo: datos.tipo
  };

  formulas.push(nueva);
  return nueva;
}

export function actualizarFormula(id, datos) {
  const formula = buscarFormula(id);

  formula.nombre = datos.nombre.trim();
  formula.formula = datos.formula.trim();
  formula.tipo = datos.tipo;

  return formula;
}

export function eliminarFormula(id) {
  const posicion = formulas.findIndex((f) => f.id === id);

  if (posicion === -1) {
    return null;
  }

  const eliminada = formulas.splice(posicion, 1);
  return eliminada[0];
}
