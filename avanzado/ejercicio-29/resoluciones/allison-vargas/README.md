# Deploy readiness para fútbol

API preparada para contenedores con configuración por entorno, respuestas de salud separadas, límites de entrada, encabezados seguros, registro estructurado y cierre ordenado.

## Ejecución local

```bash
npm install
npm test
npm start
```

Variables: `PORT` (3000 por defecto), `HOST` (`0.0.0.0` por defecto), `SHUTDOWN_TIMEOUT_MS` (10000 por defecto).

## Contenedor

```bash
docker build -t football-api .
docker run --rm -p 3000:3000 football-api
```

## Endpoints

- `GET /health/live`: confirma que el proceso responde.
- `GET /health/ready`: confirma que la aplicación puede atender tráfico.
- `GET /api/fixtures`: lista partidos simulados.

El proceso acepta `SIGTERM` y `SIGINT`, deja de aceptar conexiones y espera las solicitudes activas antes de cerrar.
