import app from './app.js';
import { origenesPermitidos } from './config/cors.js';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
  console.log(`Origenes permitidos: ${origenesPermitidos.join(', ')}`);
});
