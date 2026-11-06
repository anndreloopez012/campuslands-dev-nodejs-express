import { listScenes, getSceneById, createScene } from "../services/scenes.service.js";

function getScenes(req, res) {
  res.json({ ok: true, data: listScenes() });
}

function getScene(req, res) {
  const { id } = req.params;

  if (!Number.isInteger(Number(id))) {
    res.status(400).json({ ok: false, message: "id debe ser numerico" });
    return;
  }

  const scene = getSceneById(id);
  if (!scene) {
    res.status(404).json({ ok: false, message: `Escena con id ${id} no encontrada` });
    return;
  }

  res.json({ ok: true, data: scene });
}

function postScene(req, res) {
  try {
    const scene = createScene(req.body || {});
    res.status(201).json({ ok: true, data: scene });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getScenes, getScene, postScene };
