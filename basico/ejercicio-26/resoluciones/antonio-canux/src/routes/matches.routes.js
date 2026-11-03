import { Router } from 'express';

const router = Router();
let matches = [
  { id: 1, map: "Mirage", teamA: "Sentinels", teamB: "Fnatic", score: "13-11" }
];

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "codigos de estado"
  });
});

router.get('/matches', (req, res) => {
  res.status(200).json({ ok: true, data: matches });
});

router.get('/matches/:id', (req, res) => {
  const found = matches.find(m => m.id === Number(req.params.id));
  if (!found) return res.status(404).json({ ok: false, message: "Partida no encontrada" });
  res.status(200).json({ ok: true, data: found });
});

router.post('/matches', (req, res) => {
  const { map, teamA, teamB, score } = req.body;
  if (!map || !teamA || !teamB) {
    return res.status(400).json({ ok: false, message: "Datos incompletos para registrar la partida" });
  }
  const newM = { id: matches.length > 0 ? Math.max(...matches.map(m => m.id)) + 1 : 1, map, teamA, teamB, score: score || "0-0" };
  matches.push(newM);
  res.status(201).json({ ok: true, data: newM });
});

router.delete('/matches/:id', (req, res) => {
  const idx = matches.findIndex(m => m.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ ok: false, message: "Partida no encontrada" });
  matches.splice(idx, 1);
  res.status(204).send();
});

export default router;
