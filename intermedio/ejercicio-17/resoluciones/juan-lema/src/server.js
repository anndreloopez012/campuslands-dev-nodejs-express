import app from "./app.js";

const PORT = process.env.PORT || 4017;

app.listen(PORT, () => {
  console.log(`API de viajes y turismo escuchando en http://localhost:${PORT}`);
});
