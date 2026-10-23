const STATUSES = ["operativa", "en_taller"];

function validateMotorcycle(req, res, next) {
  const { brand, model, cc, status } = req.body || {};

  if (!brand || typeof brand !== "string" || !brand.trim()) return res.status(400).json({ ok: false, message: "brand es obligatorio" });
  if (!model || typeof model !== "string" || !model.trim()) return res.status(400).json({ ok: false, message: "model es obligatorio" });

  const numericCc = Number(cc);
  if (!cc || Number.isNaN(numericCc) || numericCc <= 0) return res.status(400).json({ ok: false, message: "cc debe ser un numero mayor a 0" });
  if (status !== undefined && !STATUSES.includes(status)) return res.status(400).json({ ok: false, message: `status debe ser uno de: ${STATUSES.join(", ")}` });

  next();
}

export { validateMotorcycle };
