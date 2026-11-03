const express = require('express');
const app = express();
app.use('/api/players', require('./routes/players.routes'));
app.get('/health', (req, res) => res.json({ ok: true }));
app.listen(process.env.PORT || 3000, () => console.log('API de jugadores lista'));
