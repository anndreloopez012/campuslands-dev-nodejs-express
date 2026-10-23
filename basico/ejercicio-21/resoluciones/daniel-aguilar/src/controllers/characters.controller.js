const characters = require('../data/characters');

const list = (req, res) => res.json({ ok: true, total: characters.length, characters });

function detail(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
  }
  const character = characters.find((item) => item.id === id);
  if (!character) return res.status(404).json({ ok: false, message: 'Personaje no encontrado' });
  res.json({ ok: true, character });
}

module.exports = { list, detail };
