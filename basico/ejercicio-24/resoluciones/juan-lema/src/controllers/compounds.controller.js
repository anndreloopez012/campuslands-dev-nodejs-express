import {
  listCompounds,
  getCompoundById,
  createCompound,
  updateCompound,
  deleteCompound,
} from "../services/compounds.service.js";

function getCompounds(req, res) {
  res.json({ ok: true, data: listCompounds() });
}

function getCompound(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const compound = getCompoundById(id);
  if (!compound) {
    res.status(404).json({ ok: false, message: `Compuesto con id ${id} no encontrado` });
    return;
  }

  res.json({ ok: true, data: compound });
}

function postCompound(req, res) {
  try {
    const compound = createCompound(req.body || {});
    res.status(201).json({ ok: true, data: compound });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

function putCompound(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  try {
    const compound = updateCompound(id, req.body || {});
    if (!compound) {
      res.status(404).json({ ok: false, message: `Compuesto con id ${id} no encontrado` });
      return;
    }
    res.json({ ok: true, data: compound });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

function removeCompound(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const removed = deleteCompound(id);
  if (!removed) {
    res.status(404).json({ ok: false, message: `Compuesto con id ${id} no encontrado` });
    return;
  }

  res.status(204).end();
}

export { getCompounds, getCompound, postCompound, putCompound, removeCompound };
