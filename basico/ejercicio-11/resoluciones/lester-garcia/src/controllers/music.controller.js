import {
  getAllSongsService,
  verifyAudioQualityService,
  addSongService
} from "../services/music.service.js";

export const getSongsController = (req, res) => {
  getAllSongsService()
    .then((songs) => {
      res.status(200).json({
        status: "success",
        total: songs.length,
        data: songs
      });
    })
    .catch((error) => {
      res.status(500).json({
        status: "error",
        message: error.message
      });
    });
};

export const verifyQualityController = (req, res) => {
  const { duration } = req.query;

  if (!duration || isNaN(Number(duration))) {
    return res.status(400).json({
      status: "error",
      message: "Debe proporcionar el parámetro de consulta 'duration' como un número."
    });
  }

  verifyAudioQualityService(Number(duration))
    .then((result) => {
      res.status(200).json({
        status: "success",
        data: result
      });
    })
    .catch((error) => {
      res.status(400).json({
        status: "error",
        message: error.message
      });
    });
};

export const createSongController = (req, res) => {
  const { title, artist, genre, durationSeconds } = req.body;

  if (!title || typeof title !== "string" || title.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "El campo 'title' es obligatorio y debe ser un texto válido."
    });
  }

  if (!artist || typeof artist !== "string" || artist.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "El campo 'artist' es obligatorio y debe ser un texto válido."
    });
  }

  if (!genre || typeof genre !== "string" || genre.trim() === "") {
    return res.status(400).json({
      status: "error",
      message: "El campo 'genre' es obligatorio y debe ser un texto válido."
    });
  }

  if (durationSeconds === undefined || isNaN(Number(durationSeconds))) {
    return res.status(400).json({
      status: "error",
      message: "El campo 'durationSeconds' es obligatorio y debe ser un número."
    });
  }

  addSongService({ title: title.trim(), artist: artist.trim(), genre: genre.trim(), durationSeconds })
    .then((newSong) => {
      res.status(201).json({
        status: "success",
        data: newSong
      });
    })
    .catch((error) => {
      res.status(400).json({
        status: "error",
        message: error.message
      });
    });
};