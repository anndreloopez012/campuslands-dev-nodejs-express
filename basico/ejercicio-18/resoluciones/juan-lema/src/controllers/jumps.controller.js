import { listJumps, createJump } from "../services/jumps.service.js";

function getJumps(req, res) {
  res.json({ ok: true, data: listJumps() });
}

function registerJump(req, res) {
  try {
    const jump = createJump(req.body || {});
    res.status(201).json({ ok: true, data: jump });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getJumps, registerJump };
