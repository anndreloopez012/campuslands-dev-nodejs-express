import express from 'express';
import transfersRoutes from './routes/transfers.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(transfersRoutes);

if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  app.listen(PORT, () => {
    console.log(`[FOOTBALL REFACTORED API] http://localhost:${PORT}`);
    console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-29`);
    console.log(`[TRANSFERS] GET/POST http://localhost:${PORT}/api/football/transfers`);
  });
}

export default app;
