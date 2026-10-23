const destinations = require('../data/destinations');

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'rutas GET',
  });

const list = (req, res) => res.json({ ok: true, total: destinations.length, destinations });

const featured = (req, res) => {
  const items = destinations.filter((destination) => destination.featured);
  res.json({ ok: true, total: items.length, destinations: items });
};

function detail(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
  }
  const destination = destinations.find((item) => item.id === id);
  if (!destination) return res.status(404).json({ ok: false, message: 'Destino no encontrado' });
  res.json({ ok: true, destination });
}

function byCountry(req, res) {
  const country = req.params.country.toLowerCase();
  const items = destinations.filter((destination) => destination.country.toLowerCase() === country);
  if (items.length === 0) {
    return res.status(404).json({ ok: false, message: `No hay destinos para "${req.params.country}"` });
  }
  res.json({ ok: true, country: items[0].country, total: items.length, destinations: items });
}

module.exports = { info, list, featured, detail, byCountry };
