import { models } from '../data/models.data.js';

const ALLOWED_EXTENSIONS = ['.obj', '.fbx', '.glb'];
const MAX_SIZE_KB = 50000;

// No se sube ningún archivo real: el cliente envía solo los metadatos
export const upload = (req, res) => {
  const { fileName, sizeKb, project } = req.body || {};

  if (typeof fileName !== 'string' || typeof sizeKb !== 'number' || !project) {
    return res.status(400).json({ ok: false, message: "Se requieren fileName, sizeKb (número) y project" });
  }

  const extension = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return res.status(415).json({ ok: false, message: "Extensión no permitida. Usa: " + ALLOWED_EXTENSIONS.join(', ') });
  }
  if (sizeKb <= 0 || sizeKb > MAX_SIZE_KB) {
    return res.status(413).json({ ok: false, message: "El tamaño debe estar entre 1 y " + MAX_SIZE_KB + " KB" });
  }

  const model = {
    id: models.length + 1,
    fileName,
    sizeKb,
    project,
    url: '/uploads/' + Date.now() + '-' + fileName,
    uploadedAt: new Date().toISOString()
  };
  models.push(model);
  res.status(201).json({ ok: true, data: model });
};

export const list = (req, res) => {
  res.status(200).json({ ok: true, total: models.length, data: models });
};
