const initialItems = [
  {
    "id": "TEL-01",
    "hypercar": "Koenigsegg Jesko Absolut",
    "topSpeedKmh": 412,
    "downforceKg": 800,
    "aeroAlertTriggered": true
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
