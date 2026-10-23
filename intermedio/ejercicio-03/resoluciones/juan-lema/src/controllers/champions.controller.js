import { listChampions, getChampionById, createChampion } from "../services/champions.service.js";

const getChampions = (req, res) => res.json({ ok: true, data: listChampions() });

function getChampion(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const champion = getChampionById(id);
  if (!champion) return res.status(404).json({ ok: false, message: `Campeon con id ${id} no encontrado` });

  res.json({ ok: true, data: champion });
}

function postChampion(req, res) {
  try {
    res.status(201).json({ ok: true, data: createChampion(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getChampions, getChampion, postChampion };
