const healthService = require("../services/health.service");

const getHealth = (req, res) => {
  try {
    const result = healthService.getHealthStatus();

    console.log("Solicitud recibida: GET /health");

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error en GET /health:", error.message);

    return res.status(500).json({
      ok: false,
      message: "Error interno del servidor"
    });
  }
};

module.exports = {
  getHealth
};