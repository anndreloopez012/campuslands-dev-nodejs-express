import app from './app.js';

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.warn('JWT_SECRET no esta definido: se usa el secreto de desarrollo');
}

app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
