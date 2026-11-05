import * as weldingService from '../services/welding.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'datos en memoria' });

export const listJobs = (_req, res) => res.status(200).json({ ok: true, total: weldingService.getAllJobs().length, data: weldingService.getAllJobs() });

export const addJob = (req, res) => {
  const { tipo, material, amperaje, espesorMm, operador } = req.body;
  if (!tipo || !material || amperaje === undefined || espesorMm === undefined) {
    return res.status(400).json({ ok: false, message: 'tipo, material, amperaje y espesorMm son requeridos.' });
  }
  const job = weldingService.createJob({ tipo, material, amperaje, espesorMm, operador });
  return res.status(201).json({ ok: true, message: 'Trabajo de soldadura registrado en memoria', data: job });
};
