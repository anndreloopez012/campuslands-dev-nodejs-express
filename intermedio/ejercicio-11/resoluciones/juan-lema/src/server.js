import app from "./app.js";

const PORT = process.env.PORT || 4011;

app.listen(PORT, () => {
  console.log(`API de musica escuchando en http://localhost:${PORT}`);
});
