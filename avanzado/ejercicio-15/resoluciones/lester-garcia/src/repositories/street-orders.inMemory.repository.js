const initialItems = [
  {
    "id": "ORD-01",
    "truckName": "Birria Tacos El Rey",
    "dish": "Quesabirria Triple",
    "priceCop": 32000,
    "spicyLevel": "Alto"
  },
  {
    "id": "ORD-02",
    "truckName": "Smash Burger Lab",
    "dish": "Doble Trufa Smash",
    "priceCop": 38000,
    "spicyLevel": "Bajo"
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
