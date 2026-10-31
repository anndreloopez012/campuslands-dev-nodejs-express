const initialItems = [
  {
    "id": "DYN-01",
    "plate": "duc-v4r",
    "bikeModel": "Ducati Panigale V4 R",
    "engineCc": 998,
    "peakWheelHp": 218.5,
    "airFuelRatio": 12.8,
    "totalInvoiceUsd": 340
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
