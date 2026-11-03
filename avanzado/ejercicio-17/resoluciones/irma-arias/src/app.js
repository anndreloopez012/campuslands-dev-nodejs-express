const express = require('express');
const { randomUUID } = require('node:crypto');
const app = express();
app.use(express.json());
const validTokens = new Set(['viaje-token-inicial']);
app.post('/refresh', (req, res) => {
  if (!validTokens.delete(req.body?.token)) return res.status(401).json({ error: 'Refresh token no valido' });
  const token = randomUUID();
  validTokens.add(token);
  res.json({ token });
});
app.listen(process.env.PORT || 3000);
