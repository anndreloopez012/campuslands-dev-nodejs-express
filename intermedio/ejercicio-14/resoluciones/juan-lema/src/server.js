import app from "./app.js";

const PORT = process.env.PORT || 4014;

app.listen(PORT, () => {
  console.log(`API de libros escuchando en http://localhost:${PORT}`);
});
