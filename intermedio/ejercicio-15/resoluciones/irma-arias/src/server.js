import express from 'express';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
const secret = process.env.JWT_SECRET || 'solo-para-demostracion-local';
app.post('/api/login', (request, response) => {
  const { username, password } = request.body ?? {};
  if (username !== 'cocinero' || password !== 'demo') return response.status(401).json({ error: 'Credenciales incorrectas.' });
  const token = jwt.sign({ sub: username }, secret, { expiresIn: '1h' });
  return response.json({ token, tokenType: 'Bearer', expiresIn: '1h' });
});
app.get('/api/orders', (request, response) => {
  const token = request.headers.authorization?.startsWith('Bearer ')
    ? request.headers.authorization.slice(7)
    : '';
  try {
    const user = jwt.verify(token, secret);
    return response.json({ user: user.sub, data: [{ id: 1, item: 'Arepa especial' }] });
  } catch {
    return response.status(401).json({ error: 'Token ausente o inválido.' });
  }
});
app.listen(process.env.PORT || 3000, () => console.log('API de comida urbana disponible en el puerto 3000'));
