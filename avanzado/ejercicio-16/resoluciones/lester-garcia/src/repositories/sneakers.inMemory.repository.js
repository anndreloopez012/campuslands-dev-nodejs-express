const initialItems = [
  {
    "id": "SNK-01",
    "sku": "AJ1-CHICAGO-85",
    "model": "Air Jordan 1 High Lost & Found",
    "colorway": "Varsity Red / Black",
    "retailUsd": 180
  },
  {
    "id": "SNK-02",
    "sku": "YZY-350-ZEBRA",
    "model": "Yeezy Boost 350 V2",
    "colorway": "White / Core Black",
    "retailUsd": 230
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
