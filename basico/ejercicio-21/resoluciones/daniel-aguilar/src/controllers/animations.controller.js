const animations = require('../data/animations');
const characters = require('../data/characters');

const list = (req, res) => res.json({ ok: true, total: animations.length, animations });

function detail(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
  }
  const animation = animations.find((item) => item.id === id);
  if (!animation) return res.status(404).json({ ok: false, message: 'Animacion no encontrada' });
  res.json({ ok: true, animation });
}

function create(req, res) {
  const { name, characterId, durationSec, fps } = req.body || {};
  const errors = [];
  if (typeof name !== 'string' || name.trim().length < 2) errors.push('name debe tener al menos 2 caracteres');
  if (!characters.some((character) => character.id === characterId)) errors.push('characterId no corresponde a un personaje existente');
  if (typeof durationSec !== 'number' || !(durationSec > 0) || durationSec > 600) errors.push('durationSec debe ser un numero entre 0 y 600');
  if (![24, 25, 30, 60].includes(fps)) errors.push('fps debe ser 24, 25, 30 o 60');
  if (errors.length > 0) return res.status(400).json({ ok: false, message: 'Datos invalidos', errors });

  const animation = {
    id: animations.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    name: name.trim(),
    characterId,
    durationSec,
    fps,
  };
  animations.push(animation);
  res.status(201).location(`/animations/${animation.id}`).json({ ok: true, animation });
}

module.exports = { list, detail, create };
