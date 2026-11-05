import { createWeaponsService } from '../services/weapons.service.js';
import { weaponsRepository } from '../repositories/weapons.repository.js';

const service = createWeaponsService(weaponsRepository);

export const strongest = (req, res) => {
  res.status(200).json({ ok: true, data: service.getStrongest() });
};

export const dps = (req, res) => {
  try {
    res.status(200).json({ ok: true, data: service.getDps(Number(req.params.id)) });
  } catch (err) {
    res.status(404).json({ ok: false, message: err.message });
  }
};
