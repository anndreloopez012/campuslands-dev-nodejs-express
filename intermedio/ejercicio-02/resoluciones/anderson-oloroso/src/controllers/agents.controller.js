import * as service from '../services/shooters.service.js';

export const listAgents = (req, res) => {
  return res.status(200).json({
    ok: true,
    module: 'Agentes / Operadores',
    total: service.getAgents().length,
    data: service.getAgents()
  });
};

export const createAgent = (req, res) => {
  try {
    const { name, role, origin, difficulty } = req.body;
    if (!name || !role) {
      return res.status(400).json({
        ok: false,
        message: 'El nombre y el rol del agente son obligatorios.'
      });
    }
    const agent = service.createAgent({ name, role, origin, difficulty });
    return res.status(201).json({
      ok: true,
      message: 'Agente registrado exitosamente',
      data: agent
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      ok: false,
      message: error.message
    });
  }
};
