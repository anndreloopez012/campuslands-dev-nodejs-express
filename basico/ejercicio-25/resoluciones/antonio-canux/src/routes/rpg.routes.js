import { Router } from 'express';

const router = Router();
const characters = [
  { id: 1, name: "Eldrin", classType: "Mago", level: 12 },
  { id: 2, name: "Lyra", classType: "Pícaro", level: 10 }
];

router.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "respuestas HTTP correctas"
  });
});

router.get('/characters', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Personajes recuperados exitosamente",
    total: characters.length,
    data: characters
  });
});

router.get('/characters/:id', (req, res) => {
  const id = Number(req.params.id);
  const found = characters.find(c => c.id === id);
  if (!found) {
    return res.status(404).json({
      ok: false,
      message: `Personaje RPG con ID ${id} no encontrado`
    });
  }
  res.status(200).json({
    ok: true,
    message: "Personaje encontrado",
    data: found
  });
});

router.post('/characters', (req, res) => {
  const { name, classType, level } = req.body;
  if (!name || !classType) {
    return res.status(400).json({
      ok: false,
      message: "Nombre y clase son campos obligatorios para forjar al héroe"
    });
  }
  const hero = { id: characters.length + 1, name: name.trim(), classType: classType.trim(), level: Number(level) || 1 };
  characters.push(hero);
  res.status(201).json({
    ok: true,
    message: "Nuevo héroe registrado en el gremio",
    data: hero
  });
});

export default router;
