const initialItems = [
  {
    "id": "LUX-01",
    "brand": "Rolls-Royce",
    "model": "Phantom Series II",
    "priceUsd": 510000,
    "bespokeInterior": "Cuero Hermes Blanco"
  },
  {
    "id": "LUX-02",
    "brand": "Bentley",
    "model": "Continental GT Speed",
    "priceUsd": 305000,
    "bespokeInterior": "Nogal Oscuro"
  }
];

let store = [...initialItems];

export const findAll = async () => [...store];

export const findById = async (id) =>
  store.find((item) => item.id.toUpperCase() === String(id).toUpperCase()) || null;

export const save = async (record) => {
  store.push(record);
  return record;
};
