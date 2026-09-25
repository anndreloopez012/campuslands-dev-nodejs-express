import app from "./app.js";

const PORT = process.env.PORT || 4012;

app.listen(PORT, () => {
  console.log(`API de peliculas de miedo escuchando en http://localhost:${PORT}`);
});
