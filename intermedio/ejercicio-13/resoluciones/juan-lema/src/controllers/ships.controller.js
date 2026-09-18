import { listShips, getShipById, createShip } from "../services/ships.service.js";

const getShips = (req, res) => res.json({ ok: true, data: listShips() });

function getShip(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const ship = getShipById(id);
  if (!ship) return res.status(404).json({ ok: false, message: `Nave con id ${id} no encontrada` });

  res.json({ ok: true, data: ship });
}

function postShip(req, res) {
  try {
    res.status(201).json({ ok: true, data: createShip(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getShips, getShip, postShip };
