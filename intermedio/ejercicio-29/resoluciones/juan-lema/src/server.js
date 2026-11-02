import { createApp } from "./app.js";

const PORT = process.env.PORT || 4029;

createApp().listen(PORT, () => {
  console.log(`API de futbol escuchando en http://localhost:${PORT}`);
});
