import * as uploadService from '../services/upload.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'subida simulada de archivos' });

export const listUploads = (_req, res) => res.status(200).json({ ok: true, total: uploadService.getUploadedBlueprints().length, data: uploadService.getUploadedBlueprints() });

export const handleUpload = (req, res) => {
  try {
    const { nombreArchivo, extension, tamanoBytes, autor } = req.body;
    if (!nombreArchivo || !extension || tamanoBytes === undefined) {
      return res.status(400).json({ ok: false, message: 'nombreArchivo, extension y tamanoBytes son obligatorios.' });
    }
    const result = uploadService.processBlueprintUpload({ nombreArchivo, extension, tamanoBytes: Number(tamanoBytes), autor });
    return res.status(201).json({ ok: true, message: 'Plano 3D subido y validado exitosamente', data: result });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};
