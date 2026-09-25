const models = Object.freeze([{ id: 1, name: 'Low poly runner', triangles: 1200, format: 'glb' }, { id: 2, name: 'Character base', triangles: 8400, format: 'fbx' }]);
function listModels() { return models.map((model) => ({ ...model })); }
function findModel(id) { return listModels().find((model) => model.id === Number(id)); }
module.exports = { listModels, findModel };
