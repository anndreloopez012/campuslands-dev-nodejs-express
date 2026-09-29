const express = require('express');
const playerRoutes = require('./routes/playerRoutes');

const app = express();

app.use(express.json());

app.use('/api', playerRoutes);

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});