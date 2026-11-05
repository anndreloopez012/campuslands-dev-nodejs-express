import { createApp } from './app.js';

const port = Number(process.env.PORT) || 3000;
createApp().listen(port, () => process.stdout.write(`API disponible en puerto ${port}\n`));
