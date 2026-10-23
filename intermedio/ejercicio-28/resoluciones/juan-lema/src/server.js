import { createApp } from "./app.js";

const PORT = process.env.PORT || 4028;

createApp().listen(PORT, () => {
  console.log(`API de battle royale escuchando en http://localhost:${PORT}`);
});
