import express from 'express';

import welcomeRoutes from './routes/welcome.routes.js';

const app = express();

app.disable('x-powered-by');
app.use(express.json());
app.use(welcomeRoutes);

app.use((request, response) => {
  response.status(404).json({
    ok: false,
    error: {
      status: 404,
      message: `Ruta no encontrada: ${request.method} ${request.originalUrl}`,
    },
  });
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && error.status === 400) {
    return response.status(400).json({
      ok: false,
      error: {
        status: 400,
        message: 'El cuerpo de la solicitud contiene JSON no válido.',
      },
    });
  }

  console.error(error);
  return response.status(500).json({
    ok: false,
    error: {
      status: 500,
      message: 'Ocurrió un error interno.',
    },
  });
});

export default app;