# Ejercicio 16: rutas protegidas

## Propósito
Proteger el catálogo de sneakers para que solo se consulte con el token de demostración esperado.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Envía `GET /catalog` con `Authorization: Bearer sneakers-demo`:
```json
["Classic Low", "Runner Pro"]
```
Sin el token correcto, la API responde `401` con `{"error":"Token requerido"}`.
