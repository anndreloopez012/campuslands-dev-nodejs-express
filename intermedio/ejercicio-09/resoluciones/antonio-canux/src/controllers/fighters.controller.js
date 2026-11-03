import { fighters } from '../data/fighters.data.js';

export const list = (req, res) => {
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 3);

  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50) {
    return res.status(400).json({ ok: false, message: "page debe ser >= 1 y limit entre 1 y 50" });
  }

  const { country, weightClass } = req.query;
  const filtered = fighters.filter((f) =>
    (!country || f.country.toLowerCase() === country.toLowerCase()) &&
    (!weightClass || f.weightClass.toLowerCase() === weightClass.toLowerCase())
  );

  const total = filtered.length;
  const start = (page - 1) * limit;

  res.status(200).json({
    ok: true,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    data: filtered.slice(start, start + limit)
  });
};
