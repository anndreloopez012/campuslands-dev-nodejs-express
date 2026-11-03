const motorcycles = [
  { id: 1, brand: "Honda", model: "CBR 600RR", displacementCC: 599, serviceType: "Mantenimiento general", status: "Listo" },
  { id: 2, brand: "Kawasaki", model: "Ninja 400", displacementCC: 399, serviceType: "Ajuste de frenos", status: "En taller" }
];

export const getAll = () => motorcycles;
export const getById = (id) => motorcycles.find(m => m.id === id);
export const create = (data) => {
  const newM = {
    id: motorcycles.length > 0 ? Math.max(...motorcycles.map(m => m.id)) + 1 : 1,
    brand: data.brand.trim(),
    model: data.model.trim(),
    displacementCC: Number(data.displacementCC),
    serviceType: data.serviceType || "Revisión básica",
    status: data.status || "Ingresada"
  };
  motorcycles.push(newM);
  return newM;
};
export const update = (id, data) => {
  const item = motorcycles.find(m => m.id === id);
  if (!item) return null;
  if (data.brand) item.brand = data.brand.trim();
  if (data.model) item.model = data.model.trim();
  if (data.displacementCC) item.displacementCC = Number(data.displacementCC);
  if (data.serviceType) item.serviceType = data.serviceType;
  if (data.status) item.status = data.status;
  return item;
};
export const remove = (id) => {
  const idx = motorcycles.findIndex(m => m.id === id);
  if (idx === -1) return null;
  return motorcycles.splice(idx, 1)[0];
};
