const heroes = [
  { id: 1, name: 'Aurelia', role: 'mid' },
  { id: 2, name: 'Bruto', role: 'tank' },
  { id: 3, name: 'Cielo', role: 'support' },
];
const matches = [];
const MODES = ['ranked', 'normal', 'torneo'];

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'logs simples',
  });

const list = (req, res) => res.json({ ok: true, heroes });

function detail(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
  }
  const hero = heroes.find((item) => item.id === id);
  if (!hero) return res.status(404).json({ ok: false, message: 'Heroe no encontrado' });
  res.json({ ok: true, hero });
}

// Los controladores reciben el logger para registrar EVENTOS DE NEGOCIO (no solo peticiones).
function makeController(logger) {
  return {
    info,
    list,
    detail,

    createMatch(req, res) {
      const { mode, durationMin, winner } = req.body || {};
      if (!MODES.includes(mode) || !Number.isInteger(durationMin) || durationMin < 1 || !['azul', 'rojo'].includes(winner)) {
        logger.warn('Partida rechazada por datos invalidos', { body: req.body });
        return res.status(400).json({
          ok: false,
          message: `Envia mode (${MODES.join('/')}), durationMin (entero >= 1) y winner (azul/rojo)`,
        });
      }
      const match = { id: matches.length + 1, mode, durationMin, winner };
      matches.push(match);
      logger.info('Partida registrada', match);
      res.status(201).location(`/matches/${match.id}`).json({ ok: true, match });
    },

    // Demuestra la redaccion de datos sensibles: la contrasena nunca llega al log.
    demoLogin(req, res) {
      const { user, password } = req.body || {};
      logger.info('Intento de login', { user, password });
      res.json({ ok: true, message: `Hola, ${user || 'invitado'}`, passwordReceived: typeof password === 'string' });
    },

    boom() {
      throw new Error('Fallo simulado del servidor');
    },
  };
}

module.exports = { makeController };
