import express from 'express';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const cars = [{ id: 1, model: 'Aurum GT', price: 180000 }];
app.get('/api/cars/:id', (request, _response, next) => {
  const car = cars.find((item) => item.id === Number(request.params.id));
  if (!car) {
    const error = new Error('Auto no encontrado.');
    error.status = 404;
    return next(error);
  }
  return _response.json({ data: car });
});
app.use(errorHandler);
app.listen(process.env.PORT || 3000, () => console.log('API de autos disponible en el puerto 3000'));
