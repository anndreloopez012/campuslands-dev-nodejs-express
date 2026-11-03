const initialItems = [
  {
    "id": "TRF-01",
    "player": "Mateo Gómez (Pivot Futsal)",
    "fromClub": "Inter Movistar",
    "toClub": "Barça Futsal",
    "amountEur": 250000,
    "status": "COMMITTED"
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
