import { WEIGHT_CLASSES, listFighters, getFighterById, createFighter } from "../services/fighters.service.js";

function getFighters(req, res) {
  const page = req.query.page ? Number(req.query.page) : 1;
  const limit = req.query.limit ? Number(req.query.limit) : 5;
  const { weightClass } = req.query;

  if (!Number.isInteger(page) || page <= 0) return res.status(400).json({ ok: false, message: "page debe ser un numero mayor a 0" });
  if (!Number.isInteger(limit) || limit <= 0) return res.status(400).json({ ok: false, message: "limit debe ser un numero mayor a 0" });
  if (weightClass && !WEIGHT_CLASSES.includes(weightClass)) return res.status(400).json({ ok: false, message: `weightClass debe ser una de: ${WEIGHT_CLASSES.join(", ")}` });

  res.json({ ok: true, ...listFighters({ page, limit, weightClass }) });
}

function getFighter(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const fighter = getFighterById(id);
  if (!fighter) return res.status(404).json({ ok: false, message: `Peleador con id ${id} no encontrado` });

  res.json({ ok: true, data: fighter });
}

function postFighter(req, res) {
  try {
    res.status(201).json({ ok: true, data: createFighter(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getFighters, getFighter, postFighter };
