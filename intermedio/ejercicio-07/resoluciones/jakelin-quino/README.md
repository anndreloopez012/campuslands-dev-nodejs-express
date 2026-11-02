# Ejercicio 07: middleware de errores

## Propósito
Consultar autos y centralizar la respuesta cuando ocurre un error.

## Ejecución y prueba
Ejecuta `npm install` y `npm start`. Para un identificador numérico, consulta `GET /cars/1`:
```json
{ "id": 1, "model": "Aurora GT" }
```
Prueba también `GET /cars/abc`.

## Resultado esperado
La consulta válida responde `200`. Un identificador no numérico responde `400` con `{"error":"El identificador debe ser numérico"}`.
