let formulas = [
  {
    id: 1,
    name: "Agua",
    formula: "H2O",
    description: "Compuesto formado por dos átomos de hidrógeno y uno de oxígeno."
  },
  {
    id: 2,
    name: "Dióxido de carbono",
    formula: "CO2",
    description: "Compuesto formado por un átomo de carbono y dos de oxígeno."
  },
  {
    id: 3,
    name: "Cloruro de sodio",
    formula: "NaCl",
    description: "Compuesto iónico formado por sodio y cloro."
  }
];

let nextId = 4;

function getAll() {
  return formulas;
}

function getById(id) {
  return formulas.find((item) => item.id === id);
}

function create(data) {
  const newFormula = {
    id: nextId++,
    ...data
  };

  formulas.push(newFormula);

  return newFormula;
}

function update(id, data) {
  const index = formulas.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  formulas[index] = {
    id,
    ...data
  };

  return formulas[index];
}

function remove(id) {
  const index = formulas.findIndex((item) => item.id === id);

  if (index === -1) {
    return null;
  }

  const deletedFormula = formulas[index];

  formulas.splice(index, 1);

  return deletedFormula;
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};