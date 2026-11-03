import app from "./app.js";

const PORT = process.env.PORT || 4016;

app.listen(PORT, () => {
  console.log(`API de sneakers escuchando en http://localhost:${PORT}`);
});
