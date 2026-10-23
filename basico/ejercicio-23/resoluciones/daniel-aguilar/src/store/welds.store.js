// "Base de datos" en memoria: vive mientras el proceso este activo y se pierde al reiniciar.
const SEED = [
  { id: 1, process: 'MIG', material: 'acero', thicknessMm: 6, amperage: 180, status: 'aprobada' },
  { id: 2, process: 'TIG', material: 'aluminio', thicknessMm: 3, amperage: 120, status: 'pendiente' },
  { id: 3, process: 'MMA', material: 'acero', thicknessMm: 10, amperage: 220, status: 'rechazada' },
];

function createStore(seed = SEED) {
  // structuredClone: el store no comparte referencias con el seed ni con quien lo consulta.
  let items = structuredClone(seed);
  let nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;

  return {
    all: () => structuredClone(items),
    find: (id) => {
      const item = items.find((entry) => entry.id === id);
      return item ? structuredClone(item) : null;
    },
    insert(data) {
      const item = { id: nextId, ...data };
      nextId += 1;
      items.push(item);
      return structuredClone(item);
    },
    reset() {
      items = structuredClone(seed);
      nextId = items.reduce((max, item) => Math.max(max, item.id), 0) + 1;
    },
  };
}

// Una sola instancia compartida por toda la aplicacion (modulo "singleton").
module.exports = { createStore, store: createStore() };
