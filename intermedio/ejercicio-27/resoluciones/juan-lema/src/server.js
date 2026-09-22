import { createApp } from "./app.js";

const PORT = process.env.PORT || 4027;

createApp().listen(PORT, () => {
  console.log(`API de MOBA esports escuchando en http://localhost:${PORT}`);
  console.log(`Documentacion interactiva en http://localhost:${PORT}/docs`);
});
