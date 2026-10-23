import { createApp } from "./app.js";

const PORT = process.env.PORT || 4026;

createApp().listen(PORT, () => {
  console.log(`API de shooters competitivos escuchando en http://localhost:${PORT}`);
});
