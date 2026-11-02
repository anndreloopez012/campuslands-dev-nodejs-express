import { welds } from '../data/welds.data.js';
import { recommendedAmperage } from '../utils/weld.js';

export const list = (req, res) => {
  res.status(200).json({ ok: true, total: welds.length, data: welds });
};

export const amperage = (req, res) => {
  try {
    const thickness = Number(req.query.thicknessMm);
    res.status(200).json({ ok: true, thicknessMm: thickness, amperage: recommendedAmperage(thickness) });
  } catch (err) {
    res.status(400).json({ ok: false, message: err.message });
  }
};
