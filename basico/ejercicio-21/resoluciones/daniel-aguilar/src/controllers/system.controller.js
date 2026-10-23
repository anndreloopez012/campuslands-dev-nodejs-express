const health = (req, res) => res.json({ ok: true, status: 'up' });

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'estructura src routes controllers',
  });

module.exports = { health, info };
