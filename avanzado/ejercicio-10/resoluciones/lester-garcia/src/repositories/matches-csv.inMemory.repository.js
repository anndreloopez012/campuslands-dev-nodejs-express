const initialItems = [
  {
    "id": "PPG-01",
    "playerA": "Ma Long",
    "playerB": "Fan Zhendong",
    "setsScore": "4-3",
    "spinRpmMax": 9200
  },
  {
    "id": "PPG-02",
    "playerA": "Hugo Calderano",
    "playerB": "Felix Lebrun",
    "setsScore": "4-2",
    "spinRpmMax": 8850
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
