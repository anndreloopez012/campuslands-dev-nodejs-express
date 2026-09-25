import app from "./app.js";

const PORT = process.env.PORT || 3019;

app.listen(PORT, () => {
  console.log(`API de tatuajes escuchando en http://localhost:${PORT}`);
});
