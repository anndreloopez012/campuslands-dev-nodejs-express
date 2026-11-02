import { config } from './config/env.js';
import app from './app.js';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('[tatuajes] Servidor activo en http://localhost:' + PORT);
});
