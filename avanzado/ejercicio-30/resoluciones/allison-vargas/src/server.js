import { createApp } from './app.js';

const port = Number(process.env.PORT) || 3000;
createApp().listen(port, () => process.stdout.write(`Taller de motos disponible en puerto ${port}\n`));
