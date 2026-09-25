import app from "./app.js";

const PORT = process.env.PORT || 4009;

app.listen(PORT, () => {
  console.log(`API de kickboxing escuchando en http://localhost:${PORT}`);
});
