# Shooter Competitive API

Instrucciones para levantar y probar el entorno de desarrollo.

## Instalación
1. Instalar dependencias: `npm install`

## Comandos Disponibles (Scripts)
* Correr en desarrollo (con auto-reload): `npm run dev`
* Correr en producción: `npm start`

## Endpoints Principales
* **GET** `/api/players/:id` -> Obtiene el rango de un jugador profesional (Prueba con id 1 o 2).
* **POST** `/api/players/match` -> Envía un JSON con `{ "username": "Player1", "kills": 20, "deaths": 10 }` para calcular el KDR.
