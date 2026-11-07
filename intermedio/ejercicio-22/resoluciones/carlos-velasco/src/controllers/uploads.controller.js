const uploadsService = require('../services/uploads.service');

function iniciarSubida(req, res, next) {
  try {
    const modelo = uploadsService.iniciarSubida(req.body);
    return res.status(201).json({ ok: true, message: 'Sesion de subida iniciada: envia chunks con POST /modelos/:id/chunks', data: modelo });
  } catch (error) {
    return next(error);
  }
}

function enviarChunk(req, res, next) {
  try {
    const modelo = uploadsService.enviarChunk(Number(req.params.id), req.body);
    const { chunks, ...sinChunks } = modelo;
    return res.status(200).json({
      ok: true,
      message: modelo.estado === 'completado' ? 'Subida completada' : 'Chunk recibido',
      data: { ...sinChunks, chunks_guardados: chunks ? chunks.length : 0 }
    });
  } catch (error) {
    return next(error);
  }
}

function listarModelos(req, res) {
  res.status(200).json({ ok: true, data: uploadsService.listarModelos() });
}

module.exports = { iniciarSubida, enviarChunk, listarModelos };
