const animationService = require("../services/animation.service");

const getAnimations = (req, res) => {
  const animations = animationService.getAllAnimations();

  return res.status(200).json({
    ok: true,
    count: animations.length,
    data: animations
  });
};

const getAnimationById = (req, res) => {
  const { id } = req.params;
  const animationId = Number(id);

  if (!Number.isInteger(animationId) || animationId <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El parámetro id debe ser un número entero positivo"
    });
  }

  const animation = animationService.getAnimationById(animationId);

  if (!animation) {
    return res.status(404).json({
      ok: false,
      message: "Animación 3D no encontrada"
    });
  }

  return res.status(200).json({
    ok: true,
    data: animation
  });
};

const createAnimation = (req, res) => {
  const { title, software, duration } = req.body;

  if (!title || !software || duration === undefined) {
    return res.status(400).json({
      ok: false,
      message: "Los campos title, software y duration son obligatorios"
    });
  }

  if (
    typeof title !== "string" ||
    typeof software !== "string" ||
    typeof duration !== "number"
  ) {
    return res.status(400).json({
      ok: false,
      message: "title y software deben ser texto, y duration debe ser un número"
    });
  }

  if (title.trim() === "" || software.trim() === "") {
    return res.status(400).json({
      ok: false,
      message: "title y software no pueden estar vacíos"
    });
  }

  if (duration <= 0) {
    return res.status(400).json({
      ok: false,
      message: "duration debe ser un número mayor que cero"
    });
  }

  const animation = animationService.createAnimation({
    title: title.trim(),
    software: software.trim(),
    duration
  });

  return res.status(201).json({
    ok: true,
    message: "Animación 3D creada correctamente",
    data: animation
  });
};

module.exports = {
  getAnimations,
  getAnimationById,
  createAnimation
};