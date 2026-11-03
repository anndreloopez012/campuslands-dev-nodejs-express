import { Router } from 'express';

const router = Router();
const lobbies = [
  { id: 1, map: "Erangel", maxPlayers: 100, currentPlayers: 94, status: "Waiting" },
  { id: 2, map: "Kings Canyon", maxPlayers: 60, currentPlayers: 60, status: "In-Game" }
];

router.get('/', (req, res) => {
  res.json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "configuracion por entorno"
  });
});

router.get('/config', (req, res) => {
  res.json({
    ok: true,
    environment: process.env.NODE_ENV || "development",
    port: process.env.PORT || 3000,
    serverRegion: process.env.SERVER_REGION || "LATAM-North"
  });
});

router.get('/lobbies', (req, res) => {
  res.json({ ok: true, data: lobbies });
});

export default router;
