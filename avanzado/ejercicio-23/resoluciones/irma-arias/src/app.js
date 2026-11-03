const express = require('express');
const app = express();
setInterval(() => console.log('Revision programada del taller', new Date().toISOString()), 60000);
app.get('/jobs', (req, res) => res.json({ scheduled: true, interval: '1 minuto' }));
app.listen(process.env.PORT || 3000);
