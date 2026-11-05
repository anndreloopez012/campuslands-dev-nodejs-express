import { Router } from 'express';
import agentsRouter from './agents.routes.js';
import weaponsRouter from './weapons.routes.js';
import matchesRouter from './matches.routes.js';

const mainRouter = Router();

// Endpoint según README de entrega
mainRouter.get('/intermedio/ejercicio-02', (req, res) => {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'routers modulares'
  });
});

// Montaje modular de sub-routers
mainRouter.use('/api/shooters/agents', agentsRouter);
mainRouter.use('/api/shooters/weapons', weaponsRouter);
mainRouter.use('/api/shooters/matches', matchesRouter);

export default mainRouter;
