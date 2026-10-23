import { listHypercars, getHypercarById, createHypercar } from "../services/hypercars.service.js";

const getHypercars = (req, res) => res.json({ ok: true, requestId: req.id, data: listHypercars() });

function getHypercar(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, requestId: req.id, message: "id debe ser numerico" });

  const hypercar = getHypercarById(id);
  if (!hypercar) return res.status(404).json({ ok: false, requestId: req.id, message: `Hiperdeportivo con id ${id} no encontrado` });

  res.json({ ok: true, requestId: req.id, data: hypercar });
}

function postHypercar(req, res) {
  try {
    res.status(201).json({ ok: true, requestId: req.id, data: createHypercar(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, requestId: req.id, message: error.message });
  }
}

export { getHypercars, getHypercar, postHypercar };
