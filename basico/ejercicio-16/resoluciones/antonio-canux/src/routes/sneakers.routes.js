import { Router } from 'express';

const router = Router();

const sneakers = [
  { id: 1, brand: "Nike", model: "Air Jordan 1 Retro", size: 42, inStock: true },
  { id: 2, brand: "Adidas", model: "Yeezy Boost 350", size: 41, inStock: false },
  { id: 3, brand: "New Balance", model: "550 White Green", size: 43, inStock: true }
];

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "primer servidor Express"
  });
});

router.get('/sneakers', (req, res) => {
  res.json({ ok: true, total: sneakers.length, data: sneakers });
});

router.get('/info', (req, res) => {
  res.json({
    ok: true,
    store: "Urban Kicks & Streetwear",
    location: "Online",
    status: "Open"
  });
});

export default router;
