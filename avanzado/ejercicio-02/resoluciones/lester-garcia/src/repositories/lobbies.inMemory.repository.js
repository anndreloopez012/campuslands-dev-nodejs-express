const initialItems = [
  {
    "id": "LOB-01",
    "code": "VAL-IMMORTAL-01",
    "map": "Ascent",
    "mode": "Ranked_5v5",
    "averageMmr": 2450,
    "playersCount": 10,
    "status": "ACTIVE"
  },
  {
    "id": "LOB-02",
    "code": "CS2-PREMIER-09",
    "map": "Mirage",
    "mode": "Premier_5v5",
    "averageMmr": 2100,
    "playersCount": 8,
    "status": "WAITING"
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
