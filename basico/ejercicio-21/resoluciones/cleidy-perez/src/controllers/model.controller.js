const { listModels, findModel } = require('../services/model.service');
function list(res) { res.end(JSON.stringify({ ok: true, data: listModels() })); }
function show(id, res) { const model = findModel(id); res.statusCode = model ? 200 : 404; res.end(JSON.stringify(model ? { ok: true, data: model } : { ok: false, error: 'Modelo no encontrado' })); }
module.exports = { list, show };
