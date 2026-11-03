const express = require('express');
const app = express();
let visits = 0;
app.get('/books', (req, res) => { visits++; res.json(['El viajero']); });
app.get('/metrics', (req, res) => res.json({ bookRequests: visits }));
app.listen(process.env.PORT || 3000);
