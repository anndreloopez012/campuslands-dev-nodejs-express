import app from "./app.js";

const PORT = process.env.PORT || 4013;

app.listen(PORT, () => {
  console.log(`API de ciencia ficcion escuchando en http://localhost:${PORT}`);
});
