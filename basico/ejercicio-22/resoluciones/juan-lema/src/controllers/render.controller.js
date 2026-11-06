import { calculateRenderBudget } from "../services/render-budget.service.js";

function postRenderBudget(req, res) {
  try {
    const budget = calculateRenderBudget(req.body || {});
    res.status(200).json({ ok: true, data: budget });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { postRenderBudget };
