import app from "./app.js";

const PORT = process.env.PORT || 3020;

app.listen(PORT, () => {
  console.log(`API de dibujo digital escuchando en http://localhost:${PORT}`);
});
