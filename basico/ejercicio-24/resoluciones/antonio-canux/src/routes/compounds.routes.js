import { Router } from 'express';

const router = Router();
let compounds = [
  { id: 1, name: "Agua", formula: "H2O", molarMass: 18.015 },
  { id: 2, name: "Dióxido de Carbono", formula: "CO2", molarMass: 44.01 }
];

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "CRUD basico"
  });
});

router.get('/compounds', (req, res) => {
  res.json({ ok: true, data: compounds });
});

router.get('/compounds/:id', (req, res) => {
  const found = compounds.find(c => c.id === Number(req.params.id));
  if (!found) return res.status(404).json({ ok: false, message: "Compuesto químico no encontrado" });
  res.json({ ok: true, data: found });
});

router.post('/compounds', (req, res) => {
  const { name, formula, molarMass } = req.body;
  if (!name || !formula) return res.status(400).json({ ok: false, message: "Nombre y fórmula son requeridos" });
  const newC = { id: compounds.length > 0 ? Math.max(...compounds.map(c => c.id)) + 1 : 1, name, formula, molarMass: Number(molarMass) || 0 };
  compounds.push(newC);
  res.status(201).json({ ok: true, data: newC });
});

router.put('/compounds/:id', (req, res) => {
  const found = compounds.find(c => c.id === Number(req.params.id));
  if (!found) return res.status(404).json({ ok: false, message: "Compuesto químico no encontrado" });
  const { name, formula, molarMass } = req.body;
  if (name) found.name = name;
  if (formula) found.formula = formula;
  if (molarMass !== undefined) found.molarMass = Number(molarMass);
  res.json({ ok: true, data: found });
});

router.delete('/compounds/:id', (req, res) => {
  const idx = compounds.findIndex(c => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ ok: false, message: "Compuesto no encontrado" });
  const del = compounds.splice(idx, 1)[0];
  res.json({ ok: true, message: "Compuesto eliminado", data: del });
});

export default router;
