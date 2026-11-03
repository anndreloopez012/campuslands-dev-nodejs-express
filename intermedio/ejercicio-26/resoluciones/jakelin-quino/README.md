# Ejercicio 26: mock de dependencias

## Propósito
Consultar jugadores a través de un repositorio sustituible. En la prueba se usa un repositorio simulado para controlar la respuesta.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm test`; la prueba debe recibir el resultado preparado por el mock:
```json
[{ "name": "Test" }]
```
Con `npm start`, `GET /players` responde con los jugadores de ejemplo de la API.
