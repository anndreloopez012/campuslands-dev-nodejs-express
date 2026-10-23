const scenesController = require('../controllers/scenes.controller');
const { sendJson } = require('../http');

function handleSceneRoutes(request, response, url) {
	if (request.method === 'GET' && url.pathname === '/scenes') {
		const result = scenesController.listScenes();
		sendJson(response, result.statusCode, result.body);
		return true;
	}

	const match = url.pathname.match(/^\/scenes\/([^/]+)$/);
	if (request.method === 'GET' && match) {
		const result = scenesController.getScene(match[1]);
		sendJson(response, result.statusCode, result.body);
		return true;
	}

	return false;
}

module.exports = handleSceneRoutes;