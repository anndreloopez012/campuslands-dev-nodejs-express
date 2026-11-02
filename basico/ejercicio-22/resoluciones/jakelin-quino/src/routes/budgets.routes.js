const { createBudget } = require('../services/render-budget.service');
const { readJson, sendJson } = require('../http');

async function handleBudgetRoutes(request, response, url) {
  if (request.method !== 'POST' || url.pathname !== '/budgets') return false;

  let body;
  try {
    body = await readJson(request);
  } catch (error) {
    sendJson(response, 400, { ok: false, error: error.message });
    return true;
  }
  const { width, height, quality } = body || {};
  const result = createBudget({ width, height, quality });

  if (!result.ok) {
    sendJson(response, 400, { ok: false, error: result.error });
    return true;
  }
  sendJson(response, 200, { ok: true, data: result.budget });
  return true;
}

module.exports = handleBudgetRoutes;