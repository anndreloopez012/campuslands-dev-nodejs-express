# Básico - Ejercicio 28: Configuración por Entorno
> **Autor:** Anderson Oloroso | **Temática:** Battle royale | **Tema:** Configuración por entorno

## Descripción
Centraliza la configuración de la aplicación en un objeto inmutable de entorno (`src/config/env.config.js`), utilizando variables de entorno de `process.env` con valores por defecto seguros para desarrollo y producción.

## Variables configurables
- `PORT`: Puerto HTTP (por defecto `3000`).
- `NODE_ENV`: Entorno de ejecución (`development`, `production`).
- `BR_REGION`: Región del clúster de juego (por defecto `SA-East (São Paulo)`).
- `BR_MAX_PLAYERS`: Máximo de jugadores en partida (por defecto `100`).
- `BR_TICKRATE`: Frecuencia de actualización en Hz (por defecto `64`).

## Instalación y ejecución
```bash
cd basico/ejercicio-28/resoluciones/anderson-oloroso
npm install

# Con variables por defecto
npm start

# Con variables personalizadas
PORT=8080 NODE_ENV=production BR_REGION="US-East" npm start
```

## Endpoints
- `GET /basico/ejercicio-28` -> Health check.
- `GET /api/br/server-status` -> Estado configurado del servidor.

## Estructura
```text
basico/ejercicio-28/resoluciones/anderson-oloroso/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── config/
    │   └── env.config.js
    ├── controllers/
    │   └── matchmaking.controller.js
    ├── routes/
    │   └── matchmaking.routes.js
    └── services/
        └── matchmaking.service.js
```
