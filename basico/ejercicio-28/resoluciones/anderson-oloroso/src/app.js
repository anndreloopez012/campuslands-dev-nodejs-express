import express from 'express';
import { config } from './config/env.config.js';
import mmRoutes from './routes/matchmaking.routes.js';

const app = express();
app.use(express.json());
app.use(mmRoutes);

app.listen(config.port, () => {
  console.log(`[BATTLE ROYALE SERVER - ${config.env.toUpperCase()}] Puerto: ${config.port}`);
  console.log(`[STATUS] GET http://localhost:${config.port}/api/br/server-status`);
});
