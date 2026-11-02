import { listMotorcycles, getMotorcycleById, createMotorcycle } from "../services/motorcycles.service.js";

const getMotorcycles = (req, res) => res.json({ ok: true, data: listMotorcycles() });

function getMotorcycle(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const motorcycle = getMotorcycleById(id);
  if (!motorcycle) return res.status(404).json({ ok: false, message: `Moto con id ${id} no encontrada` });

  res.json({ ok: true, data: motorcycle });
}

const postMotorcycle = (req, res) => res.status(201).json({ ok: true, data: createMotorcycle(req.body) });

export { getMotorcycles, getMotorcycle, postMotorcycle };
