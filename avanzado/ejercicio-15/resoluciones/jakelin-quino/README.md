# Ejercicio 15: seguridad de headers

## Propósito
Agregar encabezados HTTP que reducen algunos riesgos comunes al consultar el menú de comida.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`, luego consulta `GET /menu`:
```json
["Arepa", "Hamburguesa"]
```
La respuesta incluye encabezados como `X-Content-Type-Options: nosniff` y `X-Frame-Options: DENY`.
