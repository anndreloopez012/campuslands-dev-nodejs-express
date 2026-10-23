import { Router } from 'express';

const router = Router();
const tournaments = [
  { id: 1, name: "Worlds Championship", game: "League of Legends", prizePoolUSD: 2225000 }
];

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "logs simples"
  });
});

router.get('/tournaments', (req, res) => {
  res.json({ ok: true, data: tournaments });
});

router.post('/tournaments', (req, res) => {
  const { name, game, prizePoolUSD } = req.body;
  if (!name || !game) return res.status(400).json({ ok: false, message: "Nombre y juego son obligatorios" });
  const newT = { id: tournaments.length + 1, name, game, prizePoolUSD: Number(prizePoolUSD) || 0 };
  tournaments.push(newT);
  res.status(201).json({ ok: true, data: newT });
});

export default router;
