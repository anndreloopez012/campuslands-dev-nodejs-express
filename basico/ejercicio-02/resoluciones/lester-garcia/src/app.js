import express from 'express';
import playerRoutes from './routes/playerRoutes.js'; // NOTA: En ES Modules es OBLIGATORIO poner la extensión .js

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api/players', playerRoutes);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
