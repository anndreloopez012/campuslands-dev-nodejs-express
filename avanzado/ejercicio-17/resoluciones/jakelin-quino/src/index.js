const express = require('express');
const { randomBytes } = require('node:crypto');

const app = express();
const activeTokens = new Map();
app.use(express.json());
const token = () => randomBytes(24).toString('hex');
const issueTokens = (user) => {
  const refreshToken = token();
  activeTokens.set(refreshToken, user);
  return { accessToken: token(), refreshToken };
};
app.post('/login', (req, res) => {
  if (typeof req.body?.user !== 'string' || !req.body.user.trim()) {
    return res.status(400).json({ error: 'El usuario es obligatorio' });
  }
  res.json(issueTokens(req.body.user.trim()));
});
app.post('/refresh', (req, res) => {
  const user = activeTokens.get(req.body?.refreshToken);
  if (!user) return res.status(401).json({ error: 'Refresh token inválido o usado' });
  activeTokens.delete(req.body.refreshToken);
  res.json(issueTokens(user));
});
app.listen(3000, () => console.log('Viajes API en http://localhost:3000'));
