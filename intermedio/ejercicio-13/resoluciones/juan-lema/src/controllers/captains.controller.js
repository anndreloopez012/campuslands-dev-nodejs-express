import { listCaptains, getCaptainById, createCaptain } from "../services/captains.service.js";
import { listShipsByCaptain } from "../services/ships.service.js";

const getCaptains = (req, res) => res.json({ ok: true, data: listCaptains() });

function getCaptain(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const captain = getCaptainById(id);
  if (!captain) return res.status(404).json({ ok: false, message: `Capitan con id ${id} no encontrado` });

  res.json({ ok: true, data: { ...captain, ships: listShipsByCaptain(captain.id) } });
}

function postCaptain(req, res) {
  try {
    res.status(201).json({ ok: true, data: createCaptain(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getCaptains, getCaptain, postCaptain };
