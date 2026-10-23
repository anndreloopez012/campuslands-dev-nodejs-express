import express from 'express';
import routes from './routes/artworks.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware express.json esencial para parsear cuerpos application/json
app.use(express.json());

// Middleware para capturar JSON malformado
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ ok: false, message: "JSON inválido en el cuerpo de la petición" });
  }
  next();
});

app.use('/basico/ejercicio-20', routes);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Servidor de Dibujo Digital corriendo en puerto ${PORT}`);
  });
}

export default app;
