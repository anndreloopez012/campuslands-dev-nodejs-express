const configService = require("../services/config.service");

function getHealth(req, res) {
  const config = configService.getEnvironmentConfig();

  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "variables de entorno",
    app: config.appName,
    environment: config.environment
  });
}

function getConfig(req, res) {
  const config = configService.getEnvironmentConfig();

  res.status(200).json({
    ok: true,
    message: "Configuracion obtenida correctamente",
    data: {
      appName: config.appName,
      environment: config.environment,
      port: config.port
    }
  });
}

module.exports = {
  getHealth,
  getConfig
};