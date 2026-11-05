import * as transfersService from '../services/transfers.service.js';

export const getHealth = (_req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'refactor de API'
  });
};

export const listTransfers = (req, res) => {
  const { tipo } = req.query;
  const data = transfersService.getTransfers(tipo);
  return res.status(200).json({
    ok: true,
    total: data.length,
    filtroTipo: tipo || 'todos',
    data
  });
};

export const postTransfer = (req, res) => {
  try {
    const transfer = transfersService.processTransfer(req.body);
    return res.status(201).json({
      ok: true,
      message: 'Fichaje procesado y registrado por la federación',
      data: transfer
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};
