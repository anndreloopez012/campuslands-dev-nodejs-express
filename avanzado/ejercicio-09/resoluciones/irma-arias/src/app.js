const express = require('express');
const { Readable } = require('node:stream');
const app = express();
app.get('/training', (req, res) => Readable.from(['Calentamiento\n', 'Tecnica\n', 'Enfriamiento\n']).pipe(res));
app.listen(process.env.PORT || 3000);
