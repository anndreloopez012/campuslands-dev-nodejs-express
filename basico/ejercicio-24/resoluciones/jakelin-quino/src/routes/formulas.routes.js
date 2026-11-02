const formulasController = require('../controllers/formulas.controller');
const { readJson, sendJson } = require('../http');

async function handleFormulaRoutes(request, response, url) {
	const match = url.pathname.match(/^\/formulas(?:\/([^/]+))?$/);
	if (!match) return false;

	const id = match[1];
	let result;
	if (request.method === 'GET' && !id) {
		result = formulasController.listFormulas();
	} else if (request.method === 'GET' && id) {
		result = formulasController.getFormula(id);
	} else if (request.method === 'DELETE' && id) {
		result = formulasController.deleteFormula(id);
	} else if ((request.method === 'POST' && !id) || (request.method === 'PUT' && id)) {
		let body;
		try {
			body = await readJson(request);
		} catch (error) {
			sendJson(response, 400, { ok: false, error: error.message });
			return true;
		}
		result = request.method === 'POST'
			? formulasController.createFormula(body)
			: formulasController.updateFormula(id, body);
	} else {
		return false;
	}

	sendJson(response, result.statusCode, result.body);
	return true;
}

module.exports = handleFormulaRoutes;