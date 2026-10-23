const trainingService = require('../services/training.service');

const getTrainingSessions = async (req, res) => {
  try {
    const stream = trainingService.createTrainingStream();

    res.status(200);
    res.setHeader('Content-Type', 'application/json; charset=utf-8');

    const sessions = [];

    for await (const session of stream) {
      sessions.push(session);
    }

    res.json({
      ok: true,
      message: 'Sesiones de kickboxing obtenidas correctamente',
      topic: 'streams basicos',
      data: sessions
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'No fue posible obtener las sesiones de entrenamiento'
    });
  }
};

module.exports = {
  getTrainingSessions
};