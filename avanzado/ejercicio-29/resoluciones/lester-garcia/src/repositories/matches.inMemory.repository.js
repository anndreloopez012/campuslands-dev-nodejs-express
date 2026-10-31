const initialItems = [
  {
    "id": "MTC-01",
    "competition": "LNFS Primera División",
    "homeTeam": "Palma Futsal",
    "awayTeam": "ElPozo Murcia",
    "score": "4-3",
    "venueReady": true
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
