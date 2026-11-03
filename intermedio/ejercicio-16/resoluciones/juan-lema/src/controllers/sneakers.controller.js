import { listSneakers, getSneakerById } from "../services/sneakers.service.js";

const getSneakers = (req, res) => res.json({ ok: true, data: listSneakers() });

function getSneaker(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const sneaker = getSneakerById(id);
  if (!sneaker) return res.status(404).json({ ok: false, message: `Sneaker con id ${id} no encontrado` });

  res.json({ ok: true, data: sneaker });
}

export { getSneakers, getSneaker };
