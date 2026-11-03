import { listRenders, getRenderById, createRender } from "../services/renders.service.js";

const getRenders = (req, res) => res.json({ ok: true, data: listRenders() });

function getRender(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const render = getRenderById(id);
  if (!render) return res.status(404).json({ ok: false, message: `Render con id ${id} no encontrado` });

  res.json({ ok: true, data: render });
}

function postRender(req, res) {
  try {
    res.status(201).json({ ok: true, data: createRender(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getRenders, getRender, postRender };
