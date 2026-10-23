const workshopController = require('../controllers/workshop.controller');
const { readJson, sendJson } = require('../http');

async function handleWorkshopRoutes(request, response, url) {
	let result;
	if (request.method === 'GET' && url.pathname === '/motorcycles') {
		result = workshopController.listMotorcycles();
	} else if (request.method === 'GET' && /^\/motorcycles\/[^/]+$/.test(url.pathname)) {
		result = workshopController.getMotorcycle(url.pathname.split('/')[2]);
	} else if (request.method === 'GET' && url.pathname === '/work-orders') {
		result = workshopController.listWorkOrders();
	} else if (request.method === 'POST' && ['/motorcycles', '/work-orders'].includes(url.pathname)) {
		let body;
		try {
			body = await readJson(request);
		} catch (error) {
			sendJson(response, 400, { ok: false, error: error.message });
			return true;
		}
		result = url.pathname === '/motorcycles'
			? workshopController.createMotorcycle(body)
			: workshopController.createWorkOrder(body);
	} else {
		return false;
	}

	sendJson(response, result.statusCode, result.body);
	return true;
}

module.exports = handleWorkshopRoutes;