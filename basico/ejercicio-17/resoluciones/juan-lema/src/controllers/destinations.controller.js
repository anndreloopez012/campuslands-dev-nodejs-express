import { getAll, getById } from "../services/destinations.service.js";

async function listDestinations(req, res) {
  const destinations = await getAll();
  res.json({ ok: true, data: destinations });
}

async function getDestination(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const destination = await getById(id);
  if (!destination) {
    res.status(404).json({ ok: false, message: `Destino con id ${id} no encontrado` });
    return;
  }

  res.json({ ok: true, data: destination });
}

export { listDestinations, getDestination };
