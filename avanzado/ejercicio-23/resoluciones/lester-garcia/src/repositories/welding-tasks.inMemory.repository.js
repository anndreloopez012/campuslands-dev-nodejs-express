const initialItems = [
  {
    "id": "WLD-01",
    "stationCode": "TIG-CELL-01",
    "processType": "GTAW_TIG_Inox",
    "shieldingGasBar": 8.5,
    "lastScheduledCheck": "2026-10-30T12:00:00.000Z"
  },
  {
    "id": "WLD-02",
    "stationCode": "MIG-ROBOT-04",
    "processType": "GMAW_MIG_Carbon",
    "shieldingGasBar": 4.1,
    "lastScheduledCheck": "2026-10-30T12:00:00.000Z"
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
