# Ejercicio 10: Ordenamiento de resultados

## Propósito

Ordenar resultados de torneos de ping-pong por nombre o puntos. Se permite elegir orden ascendente o descendente y se limita la selección de campos para evitar ordenar por propiedades arbitrarias.

## Ejecución y prueba

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`. Ejemplo: `GET /api/players?sort=points&order=desc`. Los valores admitidos para `sort` son `name` y `points`; para `order`, `asc` y `desc`.
