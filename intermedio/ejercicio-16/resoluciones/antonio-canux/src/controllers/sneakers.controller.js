import { sneakers } from '../data/sneakers.data.js';

export const list = (req, res) => {
  res.status(200).json({ ok: true, total: sneakers.length, data: sneakers });
};

export const create = (req, res) => {
  const { brand, model, sizeUs, priceUsd } = req.body || {};
  if (!brand || !model || typeof sizeUs !== 'number' || typeof priceUsd !== 'number') {
    return res.status(400).json({ ok: false, message: "Se requieren brand, model, sizeUs y priceUsd" });
  }

  const sneaker = { id: Math.max(0, ...sneakers.map((s) => s.id)) + 1, brand, model, sizeUs, priceUsd };
  sneakers.push(sneaker);
  res.status(201).json({ ok: true, data: sneaker, createdBy: req.user.email });
};
