import express from 'express';
import brCollectionRoutes from './routes/brCollection.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(brCollectionRoutes);

if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  app.listen(PORT, () => {
    console.log(`[BR HTTP COLLECTION SERVER] http://localhost:${PORT}`);
    console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-28`);
    console.log(`[COLLECTION FILE] requests.http`);
  });
}

export default app;
