import express from 'express';
import { config } from './config.js';

const app = express();
app.get('/api/studio', (_request, response) => response.json({ name: config.studioName }));
app.listen(config.port, () => console.log(`${config.studioName}: servidor en puerto ${config.port}`));
