const initialItems = [
  {
    "id": "SES-01",
    "traveler": "camila.viajera@turismo.co",
    "destination": "Kyoto, Japón",
    "refreshToken": "rt_initial_991a",
    "rotatedCount": 0,
    "revoked": false
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
