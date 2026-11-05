import * as scenesService from '../services/scenes.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'estructura src routes controllers' });
};

export const listScenes = (req, res) => {
  const data = scenesService.getAllScenes();
  return res.status(200).json({ ok: true, total: data.length, data });
};

export const getScene = (req, res) => {
  try {
    const data = scenesService.getSceneById(req.params.id);
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};
