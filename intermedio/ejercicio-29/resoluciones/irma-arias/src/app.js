import express from 'express';
import teamsRouter from './routes/teams.js';

const app = express();
app.use(express.json());
app.use('/api/teams', teamsRouter);
export default app;
