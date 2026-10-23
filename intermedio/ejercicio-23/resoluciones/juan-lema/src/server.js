import app from "./app.js";

const PORT = process.env.PORT || 4023;

app.listen(PORT, () => {
  console.log(`API de soldadura escuchando en http://localhost:${PORT}`);
});
