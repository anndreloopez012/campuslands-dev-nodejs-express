import { Router } from 'express';
import weaponsRoutes from './weapons.routes.js';
import mapsRoutes from './maps.routes.js';

const apiRouter = Router();

apiRouter.use('/weapons', weaponsRoutes);
apiRouter.use('/maps', mapsRoutes);

export default apiRouter;
