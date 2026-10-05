import { Router } from 'express';

const router = Router();

const artworks = [
  { id: 1, title: "Cyber Samurai", software: "Procreate", canvasResolution: "4000x3000", layers: 45 }
];

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "middleware express.json"
  });
});

router.get('/artworks', (req, res) => {
  res.json({ ok: true, data: artworks });
});

router.post('/artworks', (req, res) => {
  // express.json() ya parseó el body
  const { title, software, canvasResolution, layers } = req.body;

  if (!title || !software) {
    return res.status(400).json({
      ok: false,
      message: "Se requiere 'title' y 'software' en el cuerpo JSON"
    });
  }

  const newArtwork = {
    id: artworks.length + 1,
    title: title.trim(),
    software: software.trim(),
    canvasResolution: canvasResolution || "1920x1080",
    layers: Number(layers) || 1
  };

  artworks.push(newArtwork);
  res.status(201).json({
    ok: true,
    message: "Ilustración digital parseada con express.json() y registrada con éxito",
    data: newArtwork
  });
});

export default router;
