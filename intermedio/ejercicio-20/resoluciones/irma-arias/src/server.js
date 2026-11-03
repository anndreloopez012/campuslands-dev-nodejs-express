import express from 'express';
import cors from 'cors';

const app = express();
const allowedOrigins = ['http://localhost:5173', 'https://dibujos.example'];
app.use(cors({
  origin(origin, callback) {
    callback(null, !origin || allowedOrigins.includes(origin));
  }
}));
app.get('/api/palettes', (_request, response) => response.json({ data: ['carmín', 'amarillo', 'azul'] }));
app.listen(process.env.PORT || 3000, () => console.log('API de dibujo digital disponible en el puerto 3000'));
