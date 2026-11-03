const initialItems = [
  {
    "id": "BIM-01",
    "project": "Torre Bioclimática Medellín",
    "format": "IFC4_RVT",
    "structuralStatus": "APPROVED"
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
