// env.js se importa primero para que la validacion de variables de entorno ocurra antes de arrancar cualquier otra cosa.
import { env } from './config/env.js';
import app from './app.js';

app.listen(env.PORT, () => {
  console.log('==================================');
  console.log(' El circuito para hiperdeportivos esta listo...');
  console.log('==================================');
  console.log(`Servidor escuchando en http://localhost:${env.PORT}`);
  console.log(`Marca destacada (desde .env): ${env.MARCA_DESTACADA}`);
});
