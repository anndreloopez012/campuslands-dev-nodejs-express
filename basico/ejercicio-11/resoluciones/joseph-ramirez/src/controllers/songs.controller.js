const songsService = require("../services/songs.service");

async function getSongs(req, res) {
  try {
    const songs = await songsService.getSongs();

    res.status(200).json({
      ok: true,
      message: "Canciones obtenidas correctamente",
      total: songs.length,
      data: songs
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al obtener las canciones"
    });
  }
}

async function getSongById(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        ok: false,
        message: "El ID debe ser un numero entero positivo"
      });
    }

    const song = await songsService.getSongById(id);

    if (!song) {
      return res.status(404).json({
        ok: false,
        message: "Cancion no encontrada"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Cancion encontrada correctamente",
      data: song
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al buscar la cancion"
    });
  }
}

async function getSongsByGenre(req, res) {
  try {
    const { genre } = req.params;

    if (!genre || !genre.trim()) {
      return res.status(400).json({
        ok: false,
        message: "El genero es obligatorio"
      });
    }

    const songs = await songsService.getSongsByGenre(genre);

    if (songs.length === 0) {
      return res.status(404).json({
        ok: false,
        message: "No se encontraron canciones de ese genero"
      });
    }

    res.status(200).json({
      ok: true,
      message: "Canciones encontradas correctamente",
      total: songs.length,
      data: songs
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      message: "Error al buscar canciones por genero"
    });
  }
}

module.exports = {
  getSongs,
  getSongById,
  getSongsByGenre
};