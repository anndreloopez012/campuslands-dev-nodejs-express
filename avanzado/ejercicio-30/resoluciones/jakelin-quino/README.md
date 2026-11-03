# Ejercicio 30: proyecto final avanzado

## Propósito
Consultar y registrar motos de un taller con validación, respuestas HTTP claras y una ruta de estado.

## Ejecución y resultados
Ejecuta `npm install` y `npm test` para verificar los cálculos de mantenimiento. Luego inicia con `npm start`.

`GET /health` confirma que la API está activa:
```json
{ "status": "ok", "service": "motorcycle-workshop" }
```
`GET /motos` lista las motos. Envía `POST /motos` con `{"model":"Trail","km":5000}` para obtener el registro y su próximo mantenimiento:
```json
{ "id": 2, "model": "Trail", "km": 5000, "nextServiceKm": 10000 }
```
