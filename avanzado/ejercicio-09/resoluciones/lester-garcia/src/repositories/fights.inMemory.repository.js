const initialItems = [
  {
    "id": "FGT-01",
    "fighterRed": "Rico Verhoeven",
    "fighterBlue": "Badr Hari",
    "weightClass": "Heavyweight",
    "rounds": 5,
    "totalStrikes": 248
  },
  {
    "id": "FGT-02",
    "fighterRed": "Chingiz Allazov",
    "fighterBlue": "Marat Grigorian",
    "weightClass": "Featherweight",
    "rounds": 5,
    "totalStrikes": 312
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
