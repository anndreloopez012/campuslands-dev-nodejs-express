const skydivingService = require("../services/skydiving.service");

function getJumps(req, res) {
  const jumps = skydivingService.getJumps();

  res.status(200).json({
    ok: true,
    message: "Saltos de paracaidismo obtenidos correctamente",
    data: jumps
  });
}

function createJump(req, res) {
  const { jumper, altitude, location, level } = req.body;

  if (
    typeof jumper !== "string" ||
    jumper.trim().length === 0
  ) {
    return res.status(400).json({
      ok: false,
      message: "El campo jumper es obligatorio"
    });
  }

  if (
    typeof altitude !== "number" ||
    !Number.isFinite(altitude) ||
    altitude <= 0
  ) {
    return res.status(400).json({
      ok: false,
      message: "El campo altitude debe ser un número mayor que cero"
    });
  }

  if (
    typeof location !== "string" ||
    location.trim().length === 0
  ) {
    return res.status(400).json({
      ok: false,
      message: "El campo location es obligatorio"
    });
  }

  if (
    typeof level !== "string" ||
    level.trim().length === 0
  ) {
    return res.status(400).json({
      ok: false,
      message: "El campo level es obligatorio"
    });
  }

  const jump = skydivingService.createJump({
    jumper: jumper.trim(),
    altitude,
    location: location.trim(),
    level: level.trim()
  });

  return res.status(201).json({
    ok: true,
    message: "Salto de paracaidismo creado correctamente",
    data: jump
  });
}

module.exports = {
  getJumps,
  createJump
};