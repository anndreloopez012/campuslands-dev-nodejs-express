import app from './app.js';

// El puerto tambien puede venir por CLI: node src/server.js --port=4000
function leerPuertoDesdeArgv() {
  const argumento = process.argv.find((arg) => arg.startsWith('--port='));
  return argumento ? Number(argumento.split('=')[1]) : null;
}

const PORT = leerPuertoDesdeArgv() || process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('==================================');
  console.log(' El garaje de autos de lujo abre sus puertas...');
  console.log('==================================');
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
