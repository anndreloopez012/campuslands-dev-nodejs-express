# Ejercicio 04: Servicios reutilizables

## Propósito

Reutilizar una operación de negocio que calcula la distancia restante y el porcentaje de supervivientes en una partida battle royale. La ruta y el controlador llaman al mismo servicio.

## Ejecución

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`.

## Pruebas

- `GET /api/match/summary?players=30&zone=3` calcula un resumen.
- `players` debe ser un entero positivo; una entrada inválida devuelve `400`.
