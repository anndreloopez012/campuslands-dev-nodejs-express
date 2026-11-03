import { hypercars } from '../data/hypercars.data.js';

export const list = (req, res) => {
  res.status(200).json({ ok: true, requestId: req.id, total: hypercars.length, data: hypercars });
};

export const getOne = (req, res) => {
  const car = hypercars.find((c) => c.id === Number(req.params.id));
  if (!car) return res.status(404).json({ ok: false, requestId: req.id, message: "Hiperdeportivo no encontrado" });
  res.status(200).json({ ok: true, requestId: req.id, data: car });
};
