import app from "./app.js";

const PORT = 3019;

app.listen(PORT, () => {
  console.log(`🎨 Servidor tatuajes corriendo en http://localhost:${PORT}`);
});
