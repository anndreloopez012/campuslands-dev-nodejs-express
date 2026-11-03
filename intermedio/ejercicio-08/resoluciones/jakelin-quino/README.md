# Ejercicio 08: middleware de request id

## Propósito
Asignar a cada consulta un identificador para distinguirla de otras peticiones.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Consulta `GET http://localhost:3000/cars`:
```json
{ "requestId": "<identificador único>", "cars": ["Veloce"] }
```
El identificador cambia en cada consulta y también aparece en la cabecera `X-Request-Id`.
