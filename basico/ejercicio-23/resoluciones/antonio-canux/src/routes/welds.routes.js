import { Router } from 'express';

const router = Router();
let welds = [
  { id: 1, type: "MIG", material: "Acero al carbono", amperage: 180 },
  { id: 2, type: "Electrodo revestido", material: "Hierro fundido", amperage: 120 }
];

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "datos en memoria"
  });
});

router.get('/welds', (req, res) => {
  res.json({ ok: true, total: welds.length, data: welds });
});

router.post('/welds', (req, res) => {
  const { type, material, amperage } = req.body;
  if (!type || !material) {
    return res.status(400).json({ ok: false, message: "Tipo y material son requeridos" });
  }
  const item = { id: welds.length > 0 ? Math.max(...welds.map(w => w.id)) + 1 : 1, type, material, amperage: Number(amperage) || 100 };
  welds.push(item);
  res.status(201).json({ ok: true, data: item });
});

router.delete('/welds/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = welds.findIndex(w => w.id === id);
  if (idx === -1) {
    return res.status(404).json({ ok: false, message: "Registro de soldadura no encontrado" });
  }
  const deleted = welds.splice(idx, 1)[0];
  res.json({ ok: true, message: "Registro eliminado", data: deleted });
});

export default router;
