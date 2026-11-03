import { listDishes, getDishById, createDish } from "../services/dishes.service.js";

const getDishes = (req, res) => res.json({ ok: true, data: listDishes() });

function getDish(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const dish = getDishById(id);
  if (!dish) return res.status(404).json({ ok: false, message: `Plato con id ${id} no encontrado` });

  res.json({ ok: true, data: dish });
}

function postDish(req, res) {
  try {
    res.status(201).json({ ok: true, addedBy: req.user.username, data: createDish(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getDishes, getDish, postDish };
