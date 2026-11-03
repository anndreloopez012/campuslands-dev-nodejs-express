import { Router } from 'express';

const router = Router();

const saltos = [
  { id: 1, diver: "Antonio Canux", altitudeFeet: 12000, dropzone: "Lago Atitlán", date: "2026-05-10" }
];

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "rutas POST"
  });
});

router.get('/saltos', (req, res) => {
  res.json({ ok: true, total: saltos.length, data: saltos });
});

router.post('/saltos', (req, res) => {
  const { diver, altitudeFeet, dropzone } = req.body;

  if (!diver || !altitudeFeet || !dropzone) {
    return res.status(400).json({
      ok: false,
      message: "Campos 'diver', 'altitudeFeet' y 'dropzone' son requeridos."
    });
  }

  const newSalto = {
    id: saltos.length + 1,
    diver: diver.trim(),
    altitudeFeet: Number(altitudeFeet),
    dropzone: dropzone.trim(),
    date: new Date().toISOString().split('T')[0]
  };

  saltos.push(newSalto);
  res.status(201).json({
    ok: true,
    message: "Salto registrado exitosamente",
    data: newSalto
  });
});

export default router;
