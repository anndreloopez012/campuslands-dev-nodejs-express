const scenes = [
  { id: 1, title: 'Bosque de cristal', software: 'Blender', status: 'rendering' },
  { id: 2, title: 'Ciudad orbital', software: 'Maya', status: 'storyboard' }
];

function listScenes() {
  return { statusCode: 200, body: { ok: true, data: scenes } };
}

function getScene(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id < 1) {
    return { statusCode: 400, body: { ok: false, error: 'El id debe ser un entero positivo' } };
  }

  const scene = scenes.find((item) => item.id === id);
  if (!scene) {
    return { statusCode: 404, body: { ok: false, error: 'Escena no encontrada' } };
  }

  return { statusCode: 200, body: { ok: true, data: scene } };
}

module.exports = { listScenes, getScene };