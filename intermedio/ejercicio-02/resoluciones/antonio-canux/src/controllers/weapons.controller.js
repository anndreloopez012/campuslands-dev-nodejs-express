import { weapons } from '../data/weapons.data.js';

export const listWeapons = (req, res) => {
  const { category } = req.query;
  let results = weapons;

  if (category) {
    results = results.filter(w => w.category.toLowerCase() === category.toLowerCase());
  }

  res.status(200).json({
    ok: true,
    total: results.length,
    data: results
  });
};

export const getWeaponById = (req, res) => {
  const { id } = req.params;
  const weapon = weapons.find(w => w.id === Number(id));

  if (!weapon) {
    return res.status(404).json({
      ok: false,
      message: `Arma con id ${id} no encontrada`
    });
  }

  res.status(200).json({
    ok: true,
    data: weapon
  });
};
