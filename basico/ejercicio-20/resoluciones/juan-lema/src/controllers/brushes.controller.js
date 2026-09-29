import { createBrush } from "../services/brushes.service.js";

function registerBrush(req, res) {
  try {
    const brush = createBrush(req.body || {});
    res.status(201).json({ ok: true, data: brush });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { registerBrush };
