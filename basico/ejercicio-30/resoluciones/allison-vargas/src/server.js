import app from './app.js';
import { config } from './config/index.js';

app.listen(config.puerto, () => {
  console.log('==================================');
  console.log(' El taller de motos esta abriendo sus puertas...');
  console.log('==================================');
  console.log(`Servidor escuchando en http://localhost:${config.puerto}`);
});
