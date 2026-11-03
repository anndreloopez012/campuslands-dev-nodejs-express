import { Router } from 'express';

const router = Router();
const teams = [
  { id: 1, name: "FC Barcelona Alusport", category: "Fútbol Sala", city: "Barcelona", founded: 1978 },
  { id: 2, name: "Comunicaciones FC", category: "Fútbol 11", city: "Ciudad de Guatemala", founded: 1949 }
];

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "README tecnico"
  });
});

router.get('/teams', (req, res) => {
  res.json({ ok: true, total: teams.length, data: teams });
});

router.get('/teams/:id', (req, res) => {
  const found = teams.find(t => t.id === Number(req.params.id));
  if (!found) return res.status(404).json({ ok: false, message: "Equipo no encontrado" });
  res.json({ ok: true, data: found });
});

router.post('/teams', (req, res) => {
  const { name, category, city, founded } = req.body;
  if (!name || !category) return res.status(400).json({ ok: false, message: "Nombre y categoría son requeridos" });
  const item = { id: teams.length + 1, name: name.trim(), category: category.trim(), city: city || "N/A", founded: Number(founded) || 2000 };
  teams.push(item);
  res.status(201).json({ ok: true, data: item });
});

export default router;
