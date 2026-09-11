import express from 'express';
import productRoutes from './routes/products.routes.js';

const app = express();

app.use(express.json());
app.use('/api/products', productRoutes);

app.listen(3000, () => console.log('Servidor listo en el puerto 3000'));