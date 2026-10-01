const scifiService = require('../services/scifi.service');

const getSpaceship = (req, res, next) => {
  try {
    const spaceshipId = Number(req.params.id);

    const spaceship = scifiService.getSpaceshipById(spaceshipId);

    res.status(200).json({
      ok: true,
      message: 'Nave espacial obtenida correctamente',
      topic: 'manejo de errores',
      data: spaceship
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSpaceship
};