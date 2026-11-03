const initialItems = [
  {
    "id": "DRF-01",
    "matchCode": "LCK-FINAL-G1",
    "teamName": "T1",
    "coach": "KkOma",
    "picks": [
      "Azir",
      "LeeSin",
      "Orianna",
      "Jinx",
      "Thresh"
    ],
    "bans": [
      "Nidalee",
      "Kalista",
      "Rumble"
    ]
  },
  {
    "id": "DRF-02",
    "matchCode": "LEC-SEMI-G2",
    "teamName": "G2 Esports",
    "coach": "Dylan",
    "picks": [
      "Yasuo",
      "Diana",
      "Yone",
      "KaiSa",
      "Rakan"
    ],
    "bans": [
      "Maokai",
      "Sejuani",
      "Corki"
    ]
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
