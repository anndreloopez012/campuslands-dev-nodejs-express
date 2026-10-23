import { createApp } from "./app.js";

const PORT = process.env.PORT || 4025;

createApp().listen(PORT, () => {
  console.log(`API de RPG escuchando en http://localhost:${PORT}`);
});
