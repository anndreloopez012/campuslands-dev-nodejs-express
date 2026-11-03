# Ejercicio 30: Proyecto integrador intermedio

## Propósito

Construir una API pequeña para un taller de motos. Integra rutas modulares, validación, servicio y repositorio en memoria para consultar motocicletas y registrar mantenimientos.

## Ejecución

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`. El servidor escucha en el puerto `3000` o en el valor definido por `PORT`.

## Endpoints

- `GET /api/motorcycles`: lista las motocicletas registradas.
- `POST /api/motorcycles`: crea una moto con JSON `{"brand":"Honda","model":"CB 300"}`. Devuelve `201`; campos vacíos producen `400`.
- `GET /api/motorcycles/:id/maintenance`: consulta mantenimientos de una moto. Una moto inexistente produce `404`.
- `POST /api/motorcycles/:id/maintenance`: registra un mantenimiento con JSON `{"description":"Cambio de aceite"}`.

Los datos son demostrativos y viven en memoria; al detener el servidor se reinician.
