const initialItems = [
  {
    "id": "ARN-01",
    "mapName": "Erangel Remastered",
    "maxPlayers": 100,
    "deploymentPlaneReady": true
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
