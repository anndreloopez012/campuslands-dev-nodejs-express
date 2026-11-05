import { createServer } from 'node:http';
import { createApp } from './app.js';

const port = Number(process.env.PORT) || 3000;
const server = createServer(createApp());
server.listen(port, () => process.stdout.write(`API disponible en puerto ${port}\n`));
