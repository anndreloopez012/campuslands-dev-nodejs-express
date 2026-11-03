const initialItems = [
  {
    "id": "HOR-01",
    "title": "Hereditary",
    "director": "Ari Aster",
    "releaseYear": 2018,
    "subgenre": "Terror Psicológico",
    "scareRating": 9.4
  },
  {
    "id": "HOR-02",
    "title": "The Conjuring",
    "director": "James Wan",
    "releaseYear": 2013,
    "subgenre": "Sobrenatural",
    "scareRating": 8.9
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
