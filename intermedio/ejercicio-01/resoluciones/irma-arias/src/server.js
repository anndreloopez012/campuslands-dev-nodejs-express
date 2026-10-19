import app from './app.js';

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API RPG disponible en http://localhost:${port}`));
