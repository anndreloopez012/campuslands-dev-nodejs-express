import * as workshopService from '../services/workshop.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    requestId: req.id,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'proyecto integrador intermedio'
  });
};

export const listRecords = async (req, res, next) => {
  try {
    const { page, limit, tipo } = req.query;
    const result = await workshopService.listAllRecords({ page, limit, tipo });
    return res.status(200).json({
      ok: true,
      requestId: req.id,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

export const getRecord = async (req, res, next) => {
  try {
    const record = await workshopService.getRecordById(req.params.id);
    return res.status(200).json({
      ok: true,
      requestId: req.id,
      data: record
    });
  } catch (error) {
    next(error);
  }
};

export const registerRecord = async (req, res, next) => {
  try {
    const record = await workshopService.createServiceRecord(req.body);
    return res.status(201).json({
      ok: true,
      requestId: req.id,
      message: 'Orden de servicio de motocicleta registrada con éxito',
      data: record
    });
  } catch (error) {
    next(error);
  }
};
