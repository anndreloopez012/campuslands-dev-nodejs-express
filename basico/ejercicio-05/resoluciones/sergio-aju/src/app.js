import express from 'express';
import fs from 'fs/promises';

const app = express();

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'fs para leer archivos'
  });
});

app.get('/equipos', async (req, res) => {
  try {
    const datos = await fs.readFile('./data/equipos.json', 'utf-8');
    const equipos = JSON.parse(datos);

    res.json(equipos);
  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'No se pudo leer el archivo'
    });
  }
});

export default app;