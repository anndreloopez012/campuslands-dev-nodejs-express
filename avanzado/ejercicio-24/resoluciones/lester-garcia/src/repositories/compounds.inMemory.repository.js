const initialItems = [
  {
    "id": "CHM-01",
    "formula": "H2SO4",
    "iupacName": "Ácido tetraoxosulfúrico (VI)",
    "molarMassGmol": 98.079,
    "hazardClass": "Corrosivo"
  },
  {
    "id": "CHM-02",
    "formula": "C8H10N4O2",
    "iupacName": "1,3,7-Trimetilxantina (Cafeína)",
    "molarMassGmol": 194.19,
    "hazardClass": "Moderado"
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
