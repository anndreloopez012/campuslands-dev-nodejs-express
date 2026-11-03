const express = require('express');
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');

const app = express();
app.use(express.json());
app.post('/hash', (req, res) => {
  if (typeof req.body?.password !== 'string' || !req.body.password) {
    return res.status(400).json({ error: 'La contraseña es obligatoria' });
  }
  const salt = randomBytes(16);
  const hash = scryptSync(req.body.password, salt, 32);
  res.json({ salt: salt.toString('hex'), hash: hash.toString('hex') });
});
app.post('/verify', (req, res) => {
  const { password, salt, hash } = req.body || {};
  if (![password, salt, hash].every((value) => typeof value === 'string')) {
    return res.status(400).json({ error: 'Envía password, salt y hash' });
  }
  const expected = Buffer.from(hash, 'hex');
  const actual = scryptSync(password, Buffer.from(salt, 'hex'), 32);
  res.json({ valid: expected.length === actual.length && timingSafeEqual(expected, actual) });
});

app.listen(3000, () => console.log('API de hashes en http://localhost:3000'));
