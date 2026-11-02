const express = require('express');
const bookRoutes = require('./routes/book.routes');

const app = express();

const PORT = 3000;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Servidor funcionando correctamente',
    topic: 'validacion de entrada'
  });
});

app.use(bookRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada'
  });
});

app.listen(PORT, () => {
  console.log(
    `Servidor de libros ejecutandose en http://localhost:${PORT}`
  );
});