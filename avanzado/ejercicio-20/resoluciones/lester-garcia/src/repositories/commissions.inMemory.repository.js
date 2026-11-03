const initialItems = [
  {
    "id": "COM-01",
    "illustrator": "Sakimichan_Studio",
    "client": "Alex_Dev",
    "canvasResolution": "4K_300DPI",
    "priceUsd": 220
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
