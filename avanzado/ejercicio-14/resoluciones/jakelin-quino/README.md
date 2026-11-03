# Ejercicio 14: métricas simples

## Propósito
Contar las consultas al catálogo de libros y mostrar la cantidad en una ruta de métricas.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Consulta `GET /books` y luego `GET /metrics`:
```json
{ "bookRequests": 1 }
```
El contador aumenta en uno cada vez que se consulta el catálogo.
