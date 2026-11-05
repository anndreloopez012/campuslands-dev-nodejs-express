let formulas = [
  { id: 1, nombreComun: 'Agua', formula: 'H2O', masaMolarGmol: 18.015, estado: 'Líquido' },
  { id: 2, nombreComun: 'Dióxido de Carbono', formula: 'CO2', masaMolarGmol: 44.01, estado: 'Gas' },
  { id: 3, nombreComun: 'Cloruro de Sodio', formula: 'NaCl', masaMolarGmol: 58.44, estado: 'Sólido' }
];

export const getAll = () => formulas;

export const getById = (id) => {
  const found = formulas.find(f => f.id === Number(id));
  if (!found) {
    const err = new Error(`Fórmula química con ID ${id} no encontrada.`);
    err.statusCode = 404;
    throw err;
  }
  return found;
};

export const create = ({ nombreComun, formula, masaMolarGmol, estado }) => {
  const id = formulas.length > 0 ? Math.max(...formulas.map(f => f.id)) + 1 : 1;
  const newFormula = { id, nombreComun, formula, masaMolarGmol: Number(masaMolarGmol), estado: estado || 'Desconocido' };
  formulas.push(newFormula);
  return newFormula;
};

export const update = (id, fields) => {
  const existing = getById(id);
  Object.assign(existing, fields, { id: Number(id) });
  return existing;
};

export const remove = (id) => {
  getById(id);
  formulas = formulas.filter(f => f.id !== Number(id));
  return true;
};
