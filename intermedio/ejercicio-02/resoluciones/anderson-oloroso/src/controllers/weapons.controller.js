import * as service from '../services/shooters.service.js';

export const listWeapons = (req, res) => {
  return res.status(200).json({
    ok: true,
    module: 'Arsenal / Armamento',
    total: service.getWeapons().length,
    data: service.getWeapons()
  });
};
