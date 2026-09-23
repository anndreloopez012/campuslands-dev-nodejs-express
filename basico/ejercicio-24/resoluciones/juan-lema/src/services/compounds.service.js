const compounds = [
  { id: 1, name: "Agua", formula: "H2O" },
  { id: 2, name: "Dioxido de carbono", formula: "CO2" },
];
let nextId = 3;

function listCompounds() {
  return compounds;
}

function getCompoundById(id) {
  return compounds.find((c) => c.id === Number(id)) || null;
}

function createCompound({ name, formula }) {
  validate({ name, formula });
  const compound = { id: nextId++, name: name.trim(), formula: formula.trim() };
  compounds.push(compound);
  return compound;
}

function updateCompound(id, { name, formula }) {
  const compound = getCompoundById(id);
  if (!compound) return null;

  validate({ name, formula });
  compound.name = name.trim();
  compound.formula = formula.trim();
  return compound;
}

function deleteCompound(id) {
  const index = compounds.findIndex((c) => c.id === Number(id));
  if (index === -1) return false;
  compounds.splice(index, 1);
  return true;
}

function validate({ name, formula }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("name es obligatorio");
  }
  if (!formula || typeof formula !== "string" || !formula.trim()) {
    throw new Error("formula es obligatorio");
  }
}

export { listCompounds, getCompoundById, createCompound, updateCompound, deleteCompound };
