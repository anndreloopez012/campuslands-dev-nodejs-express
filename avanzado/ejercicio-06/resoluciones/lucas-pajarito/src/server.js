import app from "./app.js";

const PORT = process.env.PORT || 4006;

app.listen(PORT, () => {
  console.log(`API de colas de taller escuchando en http://localhost:${PORT}`);
});
