import express from 'express';

import { obtenerUsuarios } from './services/service.js';

const app = express();

app.get('/', (req, res) => {
    res.send('API funcionando correctamente');
});

app.get('/usuarios', async (req, res) => {
    const usuarios = await obtenerUsuarios();

    res.json(usuarios);
});

export default app;