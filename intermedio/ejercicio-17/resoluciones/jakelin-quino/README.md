# Ejercicio 17: roles y permisos

## Propósito
Limitar el acceso a los informes turísticos según el rol de quien realiza la consulta.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Consulta `GET /reports` con la cabecera `x-role: admin`:
```json
[{ "destination": "Antigua", "bookings": 12 }]
```
Si el rol no es `admin`, la API responde `403` con `{"error":"Permiso denegado"}`.
