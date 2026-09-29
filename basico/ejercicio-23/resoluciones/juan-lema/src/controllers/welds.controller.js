import { listWelds, addWeld, removeWeld } from "../services/welds.service.js";

function getWelds(req, res) {
  res.json({ ok: true, data: listWelds() });
}

function postWeld(req, res) {
  try {
    const weld = addWeld(req.body || {});
    res.status(201).json({ ok: true, data: weld });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

function deleteWeld(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const removed = removeWeld(id);
  if (!removed) {
    res.status(404).json({ ok: false, message: `Soldadura con id ${id} no encontrada` });
    return;
  }

  res.status(204).end();
}

export { getWelds, postWeld, deleteWeld };
