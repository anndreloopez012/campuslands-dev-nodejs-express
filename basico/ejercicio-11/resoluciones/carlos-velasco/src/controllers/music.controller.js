const musicService = require('../services/music.service');

const getSong = (req, res) => {
  const songId = Number(req.params.id);

  musicService
    .getSong(songId)
    .then((song) => {
      res.status(200).json({
        ok: true,
        message: 'Cancion obtenida correctamente',
        topic: 'promesas basicas',
        data: song
      });
    })
    .catch((error) => {
      console.error('Error al obtener la cancion:', error.message);

      res.status(400).json({
        ok: false,
        message: error.message
      });
    });
};

module.exports = {
  getSong
};