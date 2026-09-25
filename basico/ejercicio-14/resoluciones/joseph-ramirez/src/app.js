const express = require("express");

const booksRoutes = require("./routes/books.routes");

const app = express();

const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "validacion de entrada"
  });
});

app.use("/books", booksRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    status: 404,
    message: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutandose en http://localhost:${PORT}`);
});