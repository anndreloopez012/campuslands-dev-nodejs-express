let compounds = [
  { id: 1, name: 'Agua', formula: 'H2O', molarMass: 18.015, category: 'inorganico' },
  { id: 2, name: 'Cloruro de sodio', formula: 'NaCl', molarMass: 58.44, category: 'inorganico' },
  { id: 3, name: 'Glucosa', formula: 'C6H12O6', molarMass: 180.156, category: 'organico' },
];
let nextId = 4;

module.exports = {
  all: () => compounds.map((item) => ({ ...item })),
  find: (id) => {
    const item = compounds.find((entry) => entry.id === id);
    return item ? { ...item } : null;
  },
  insert(data) {
    const item = { id: nextId, ...data };
    nextId += 1;
    compounds.push(item);
    return { ...item };
  },
  replace(id, data) {
    const index = compounds.findIndex((entry) => entry.id === id);
    if (index === -1) return null;
    compounds[index] = { id, ...data };
    return { ...compounds[index] };
  },
  remove(id) {
    const before = compounds.length;
    compounds = compounds.filter((entry) => entry.id !== id);
    return compounds.length < before;
  },
};
