const motorcycleService = require("../services/motorcycle.service");

const VALID_MAINTENANCE_STATUS = [
  "pendiente",
  "realizado"
];

function validateMotorcycle(data) {
  const { brand, model, year, type, maintenanceStatus } = data;

  if (!brand || typeof brand !== "string") {
    return "brand es obligatorio y debe ser texto";
  }

  if (!model || typeof model !== "string") {
    return "model es obligatorio y debe ser texto";
  }

  if (
    year === undefined ||
    !Number.isInteger(year) ||
    year < 1900 ||
    year > new Date().getFullYear() + 1
  ) {
    return "year debe ser un año válido";
  }

  if (!type || typeof type !== "string") {
    return "type es obligatorio y debe ser texto";
  }

  if (!VALID_MAINTENANCE_STATUS.includes(maintenanceStatus)) {
    return 'maintenanceStatus debe ser "pendiente" o "realizado"';
  }

  return null;
}

function getAll(req, res) {
  const motorcycles = motorcycleService.getAllMotorcycles();

  res.status(200).json({
    ok: true,
    message: "Motos obtenidas correctamente",
    data: motorcycles
  });
}

function getById(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El id debe ser un número entero positivo"
    });
  }

  const motorcycle = motorcycleService.getMotorcycleById(id);

  if (!motorcycle) {
    return res.status(404).json({
      ok: false,
      message: "Moto no encontrada"
    });
  }

  res.status(200).json({
    ok: true,
    message: "Moto obtenida correctamente",
    data: motorcycle
  });
}

function create(req, res) {
  const validationError = validateMotorcycle(req.body);

  if (validationError) {
    return res.status(400).json({
      ok: false,
      message: validationError
    });
  }

  const motorcycle = motorcycleService.createMotorcycle(req.body);

  res.status(201).json({
    ok: true,
    message: "Moto creada correctamente",
    data: motorcycle
  });
}

function update(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El id debe ser un número entero positivo"
    });
  }

  const validationError = validateMotorcycle(req.body);

  if (validationError) {
    return res.status(400).json({
      ok: false,
      message: validationError
    });
  }

  const motorcycle = motorcycleService.updateMotorcycle(
    id,
    req.body
  );

  if (!motorcycle) {
    return res.status(404).json({
      ok: false,
      message: "Moto no encontrada"
    });
  }

  res.status(200).json({
    ok: true,
    message: "Moto actualizada correctamente",
    data: motorcycle
  });
}

function remove(req, res) {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      ok: false,
      message: "El id debe ser un número entero positivo"
    });
  }

  const motorcycle = motorcycleService.deleteMotorcycle(id);

  if (!motorcycle) {
    return res.status(404).json({
      ok: false,
      message: "Moto no encontrada"
    });
  }

  res.status(200).json({
    ok: true,
    message: "Moto eliminada correctamente",
    data: motorcycle
  });
}

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove
};