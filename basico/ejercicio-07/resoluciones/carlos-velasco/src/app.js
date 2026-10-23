const express = require('express');
const healthRoutes = require('./routes/health.routes');

const app = express();

const DEFAULT_PORT = 3000;

const cliPort = process.argv[2];

const parsePort = (value) => {
  if (value === undefined) {
    return DEFAULT_PORT;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(
      'El puerto debe ser un numero entero entre 1 y 65535.'
    );
  }

  return port;
};

let port;

try {
  port = parsePort(cliPort);
} catch (error) {
  console.error(`Error de configuracion: ${error.message}`);
  process.exit(1);
}

app.use(express.json());

app.use(healthRoutes);

app.listen(port, () => {
  console.log(`Servidor de autos de lujo ejecutandose en http://localhost:${port}`);
  console.log(`Puerto recibido mediante CLI: ${port}`);
});
