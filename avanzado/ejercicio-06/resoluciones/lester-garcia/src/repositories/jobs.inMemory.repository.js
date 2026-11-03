const initialItems = [
  {
    "id": "JOB-01",
    "bikeModel": "Yamaha YZF-R1M",
    "taskType": "Remapeo_ECU_Dyno",
    "status": "COMPLETED",
    "resultHp": 202
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
