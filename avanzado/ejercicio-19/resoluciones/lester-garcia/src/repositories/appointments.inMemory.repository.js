const initialItems = [
  {
    "id": "TAT-01",
    "client": "Valeria Ríos",
    "artist": "Koji Horiyoshi",
    "style": "Irezumi Tradicional",
    "sterilizationCode": "AUTOCLAVE-901"
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
