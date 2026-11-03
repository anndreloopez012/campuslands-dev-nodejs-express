# Ejercicio 14: autenticación simulada

## Propósito
Simular una comprobación de identidad antes de mostrar el catálogo de libros.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Envía `GET /books` con la cabecera `x-user: Ana`:
```json
["El viajero", "La biblioteca"]
```
Sin esa cabecera, la API responde `401` con `{"error":"Autenticación requerida"}`.
