function makeController(config) {
  return {
    info: (req, res) =>
      res.json({
        ok: true,
        message: 'Ejercicio ejecutado correctamente',
        topic: 'configuracion por entorno',
        environment: config.env,
      }),

    // Configuracion visible: nunca incluye el valor de API_KEY.
    showConfig: (req, res) =>
      res.json({
        ok: true,
        config: {
          env: config.env,
          port: config.port,
          logLevel: config.logLevel,
          maxPlayersPerMatch: config.maxPlayersPerMatch,
          debugRoutes: config.debugRoutes,
          apiKeyConfigured: config.apiKey !== '',
        },
      }),

    limits: (req, res) => res.json({ ok: true, maxPlayersPerMatch: config.maxPlayersPerMatch }),

    // El limite de jugadores depende del entorno.
    join(req, res) {
      const players = req.body?.players;
      if (!Number.isInteger(players) || players < 1) {
        return res.status(400).json({ ok: false, message: 'players debe ser un entero mayor o igual a 1' });
      }
      if (players > config.maxPlayersPerMatch) {
        return res.status(422).json({
          ok: false,
          message: `El maximo por partida en "${config.env}" es ${config.maxPlayersPerMatch}`,
        });
      }
      res.status(201).json({ ok: true, players, slotsLeft: config.maxPlayersPerMatch - players });
    },

    // Solo existe en development y test; en production responde 404.
    debugProfile: (req, res) =>
      res.json({ ok: true, node: process.version, uptimeSec: Math.round(process.uptime()), pid: process.pid }),
  };
}

module.exports = { makeController };
