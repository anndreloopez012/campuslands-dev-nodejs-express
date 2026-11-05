import { weapons } from '../data/weapons.data.js';

// Dependencia real: en producción podría ser una base de datos
export const weaponsRepository = {
  findAll: () => weapons,
  findById: (id) => weapons.find((w) => w.id === id)
};
