import app from './app.js';

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  // el planificador revisa cada 15 segundos que jobs vencieron
  app.locals.planificador.iniciar(15_000);
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
