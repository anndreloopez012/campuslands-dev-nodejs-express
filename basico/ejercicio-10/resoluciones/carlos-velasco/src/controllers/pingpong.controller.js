const pingpongService = require('../services/pingpong.service');

const getPingPong = async (req, res) => {
  try {
    const data = await pingpongService.getPingPongData();

    res.status(200).json({
      ok: true,
      message: 'Ejercicio ejecutado correctamente',
      topic: 'funciones asincronas',
      data
    });
  } catch (error) {
    console.error('Error al obtener datos de pingpong:', error);

    res.status(500).json({
      ok: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getPingPong
};