const statusService = require("../services/status.service");

/**
 * Controlador HTTP para endpoints de estado del runtime.
 */
const getStatus = (req, res) => {
  try {
    const statusData = statusService.getSystemStatus();

    return res.status(200).json({
      ok: true,
      message: "Servidor RPG operativo y runtime activo",
      topic: "Node runtime y consola",
      data: statusData
    });
  } catch (error) {
    console.error("Error al obtener el estado del servidor:", error.message);
    return res.status(500).json({
      ok: false,
      message: "Error interno al consultar el entorno de ejecución",
      error: error.message
    });
  }
};

const getHealth = (req, res) => {
  return res.status(200).json({
    ok: true,
    status: "HEALTHY"
  });
};

module.exports = {
  getStatus,
  getHealth
};