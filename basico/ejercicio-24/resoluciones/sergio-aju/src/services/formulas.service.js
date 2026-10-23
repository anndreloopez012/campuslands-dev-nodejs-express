const formulas = [
  {
    id: 1,
    nombre: 'Agua',
    formula: 'H2O'
  },
  {
    id: 2,
    nombre: 'Dióxido de carbono',
    formula: 'CO2'
  }
];

let siguienteId = 3;

export function listarFormulas() {
  return formulas;
}

export function buscarFormula(id) {
  return formulas.find(formula => formula.id === Number(id));
}

export function crearFormula(nombre, formula) {
  const nuevaFormula = {
    id: siguienteId++,
    nombre,
    formula
  };

  formulas.push(nuevaFormula);

  return nuevaFormula;
}

export function actualizarFormula(id, nombre, formula) {
  const elemento = buscarFormula(id);

  if (!elemento) {
    return null;
  }

  elemento.nombre = nombre;
  elemento.formula = formula;

  return elemento;
}

export function eliminarFormula(id) {
  const indice = formulas.findIndex(
    formula => formula.id === Number(id)
  );

  if (indice === -1) {
    return false;
  }

  formulas.splice(indice, 1);

  return true;
}