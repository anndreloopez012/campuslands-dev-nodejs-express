let motorcycles = [
  { id: 1, placa: 'YAM-123', marca: 'Yamaha', modelo: 'MT-07', cilindrada: 689, cliente: 'Andrés Gómez', estado: 'En Diagnóstico' },
  { id: 2, placa: 'HON-456', marca: 'Honda', modelo: 'CB650R', cilindrada: 649, cliente: 'Lucía Fernández', estado: 'Listo para Entrega' }
];

export const getAll = () => motorcycles;

export const getById = (id) => {
  const found = motorcycles.find(m => m.id === Number(id));
  if (!found) {
    const err = new Error(`Motocicleta con ID ${id} no encontrada en el taller.`);
    err.statusCode = 404;
    throw err;
  }
  return found;
};

export const create = ({ placa, marca, modelo, cilindrada, cliente, estado }) => {
  const id = motorcycles.length > 0 ? Math.max(...motorcycles.map(m => m.id)) + 1 : 1;
  const newBike = { id, placa: placa.toUpperCase(), marca, modelo, cilindrada: Number(cilindrada) || 125, cliente, estado: estado || 'Ingresada' };
  motorcycles.push(newBike);
  return newBike;
};

export const update = (id, fields) => {
  const existing = getById(id);
  Object.assign(existing, fields, { id: Number(id) });
  return existing;
};

export const remove = (id) => {
  getById(id);
  motorcycles = motorcycles.filter(m => m.id !== Number(id));
  return true;
};
