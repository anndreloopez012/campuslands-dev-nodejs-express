const drawingService = require("../services/drawing.service");

const getDrawings = (req, res) => {
  const drawings = drawingService.getAllDrawings();

  return res.status(200).json({
    ok: true,
    count: drawings.length,
    data: drawings
  });
};

const createDrawing = (req, res) => {
  const { title, technique, software } = req.body;

  if (!title || !technique || !software) {
    return res.status(400).json({
      ok: false,
      message: "Los campos title, technique y software son obligatorios"
    });
  }

  if (
    typeof title !== "string" ||
    typeof technique !== "string" ||
    typeof software !== "string"
  ) {
    return res.status(400).json({
      ok: false,
      message: "Los campos title, technique y software deben ser texto"
    });
  }

  if (
    title.trim() === "" ||
    technique.trim() === "" ||
    software.trim() === ""
  ) {
    return res.status(400).json({
      ok: false,
      message: "Los campos title, technique y software no pueden estar vacíos"
    });
  }

  const drawing = drawingService.createDrawing({
    title: title.trim(),
    technique: technique.trim(),
    software: software.trim()
  });

  return res.status(201).json({
    ok: true,
    message: "Dibujo digital creado correctamente",
    data: drawing
  });
};

module.exports = {
  getDrawings,
  createDrawing
};