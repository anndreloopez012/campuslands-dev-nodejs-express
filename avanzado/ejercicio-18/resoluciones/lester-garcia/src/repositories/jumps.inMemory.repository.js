const initialItems = [
  {
    "id": "JMP-01",
    "jumperName": "Lester García",
    "jumpType": "HALO_SOLO",
    "altitudeFeet": 15000,
    "authorizedByRole": "SAFETY_DIRECTOR"
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
