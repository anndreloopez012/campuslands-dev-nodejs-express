import app from "./app.js";

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`API de shooter competitivo escuchando en http://localhost:${PORT}`);
});
