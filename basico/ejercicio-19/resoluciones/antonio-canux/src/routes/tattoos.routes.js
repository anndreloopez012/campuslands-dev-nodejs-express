import { Router } from 'express';

const router = Router();

const tattoos = [
  { id: 1, style: "Blackwork", artist: "Alex", sessions: 2, price: 150 },
  { id: 2, style: "Tradicional", artist: "Sara", sessions: 1, price: 100 },
  { id: 3, style: "Realismo", artist: "Alex", sessions: 4, price: 400 },
  { id: 4, style: "Acuarela", artist: "Elena", sessions: 2, price: 180 }
];

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "req.params y req.query"
  });
});

router.get('/tattoos', (req, res) => {
  const { style, artist } = req.query;
  let results = [...tattoos];

  if (style) {
    results = results.filter(t => t.style.toLowerCase() === style.toLowerCase());
  }
  if (artist) {
    results = results.filter(t => t.artist.toLowerCase() === artist.toLowerCase());
  }

  res.json({
    ok: true,
    total: results.length,
    query: { style: style || null, artist: artist || null },
    data: results
  });
});

router.get('/tattoos/:id', (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ ok: false, message: "El ID debe ser un número entero positivo" });
  }

  const found = tattoos.find(t => t.id === id);
  if (!found) {
    return res.status(404).json({ ok: false, message: "Diseño de tatuaje no encontrado" });
  }

  res.json({ ok: true, data: found });
});

export default router;
