const initialItems = [
  {
    "id": "BOK-01",
    "title": "Cien años de soledad",
    "author": "Gabriel García Márquez",
    "pages": 496,
    "genre": "Realismo Mágico"
  },
  {
    "id": "BOK-02",
    "title": "1984",
    "author": "George Orwell",
    "pages": 328,
    "genre": "Distopía"
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
