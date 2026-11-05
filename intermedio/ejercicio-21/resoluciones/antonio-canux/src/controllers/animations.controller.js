import { animations } from '../data/animations.data.js';

export const list = (req, res) => {
  res.status(200).json({ ok: true, total: animations.length, data: animations });
};
