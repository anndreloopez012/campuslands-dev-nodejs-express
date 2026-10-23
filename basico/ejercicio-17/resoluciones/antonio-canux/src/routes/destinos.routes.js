import { Router } from 'express';

const router = Router();

const destinos = [
  { id: 1, name: "Antigua Guatemala", country: "Guatemala", rating: 4.9, popular: true },
  { id: 2, name: "Kyoto", country: "Japón", rating: 4.8, popular: true },
  { id: 3, name: "Machu Picchu", country: "Perú", rating: 4.9, popular: true },
  { id: 4, name: "Reykjavik", country: "Islandia", rating: 4.6, popular: false }
];

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "rutas GET"
  });
});

router.get('/destinos', (req, res) => {
  res.json({ ok: true, total: destinos.length, data: destinos });
});

router.get('/destinos/top', (req, res) => {
  const top = destinos.filter(d => d.popular);
  res.json({ ok: true, data: top });
});

router.get('/destinos/:id', (req, res) => {
  const id = Number(req.params.id);
  const found = destinos.find(d => d.id === id);
  if (!found) {
    return res.status(404).json({ ok: false, message: "Destino turístico no encontrado" });
  }
  res.json({ ok: true, data: found });
});

export default router;
