import * as telemetryService from '../services/telemetry.service.js';

export const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'middleware de request id',
    requestId: req.id
  });
};

export const listTelemetry = (req, res) => {
  const data = telemetryService.getTelemetries();
  return res.status(200).json({
    ok: true,
    requestId: req.id,
    total: data.length,
    data
  });
};

export const registerTelemetry = (req, res) => {
  const { modelo, motor, potenciaCV, velocidadPuntaRegistradaKmH, ceroACienSegundos, circuito } = req.body;

  if (!modelo || !potenciaCV || !velocidadPuntaRegistradaKmH) {
    return res.status(400).json({
      ok: false,
      requestId: req.id,
      message: 'Los campos modelo, potenciaCV y velocidadPuntaRegistradaKmH son obligatorios.'
    });
  }

  const record = telemetryService.recordTelemetry({
    modelo,
    motor: motor || 'Híbrido de alta competición',
    potenciaCV: Number(potenciaCV),
    velocidadPuntaRegistradaKmH: Number(velocidadPuntaRegistradaKmH),
    ceroACienSegundos: ceroACienSegundos ? Number(ceroACienSegundos) : 2.6,
    circuito: circuito || 'Pista de pruebas privada'
  });

  return res.status(201).json({
    ok: true,
    requestId: req.id,
    message: 'Telemetría de hiperdeportivo registrada con éxito',
    data: record
  });
};
