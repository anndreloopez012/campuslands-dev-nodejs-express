const express = require('express');
const { createHmac, timingSafeEqual } = require('node:crypto');

const app = express();
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('Define JWT_SECRET antes de iniciar el servidor');
app.use(express.json());
const sign = (data) => createHmac('sha256', secret).update(data).digest('base64url');
app.post('/login', (req, res) => {
  if (!req.body?.user) return res.status(400).json({ error: 'Falta el usuario' });
  const header = Buffer.from('{"alg":"HS256","typ":"JWT"}').toString('base64url');
  const payload = Buffer.from(JSON.stringify({
    user: req.body.user,
    exp: Math.floor(Date.now() / 1000) + 3600
  })).toString('base64url');
  const data = `${header}.${payload}`;
  res.json({ token: `${data}.${sign(data)}` });
});
app.get('/menu', (req, res) => {
  const token = (req.get('authorization') || '').match(/^Bearer ([^.]+\.[^.]+\.[^.]+)$/)?.[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });
  const [header, payload, signature] = token.split('.');
  const expected = Buffer.from(sign(`${header}.${payload}`));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  let claims;
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString());
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
  if (!claims.user || !Number.isInteger(claims.exp) || claims.exp < Math.floor(Date.now() / 1000)) {
    return res.status(401).json({ error: 'Token vencido o inválido' });
  }
  res.json({ message: 'Menú de comida urbana', user: claims.user });
});

app.listen(3000, () => console.log('API comida urbana en http://localhost:3000'));
