const drawingsService = require("../services/drawings.service");

function getDrawings(req, res) {
  const drawings = drawingsService.getAllDrawings();

  res.status(200).json({
    ok: true,
    message: "Dibujos obtenidos correctamente",
    total: drawings.length,
    data: drawings
  });
}

function createDrawing(req, res) {
  const { titulo, artista, software, categoria, completado } = req.body;

  if (!titulo || typeof titulo !== "string" || titulo.trim() === "") {
    return res.status(400).json({
      ok: false,
      message: "El titulo es obligatorio y debe ser un texto"
    });
  }

  if (!artista || typeof artista !== "string" || artista.trim() === "") {
    return res.status(400).json({
      ok: false,
      message: "El artista es obligatorio y debe ser un texto"
    });
  }

  if (!software || typeof software !== "string" || software.trim() === "") {
    return res.status(400).json({
      ok: false,
      message: "El software es obligatorio y debe ser un texto"
    });
  }

  if (!categoria || typeof categoria !== "string" || categoria.trim() === "") {
    return res.status(400).json({
      ok: false,
      message: "La categoria es obligatoria y debe ser un texto"
    });
  }

  if (typeof completado !== "boolean") {
    return res.status(400).json({
      ok: false,
      message: "El campo completado debe ser booleano"
    });
  }

  const newDrawing = drawingsService.createDrawing({
    titulo: titulo.trim(),
    artista: artista.trim(),
    software: software.trim(),
    categoria: categoria.trim(),
    completado
  });

  res.status(201).json({
    ok: true,
    message: "Dibujo creado correctamente",
    data: newDrawing
  });
}

module.exports = {
  getDrawings,
  createDrawing
};