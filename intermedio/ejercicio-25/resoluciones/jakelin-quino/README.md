# Ejercicio 25: testing de rutas

## Propósito
Comprobar que la ruta de héroes RPG responde correctamente mediante una prueba HTTP automática.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm test`; la prueba debe verificar estado `200` y el siguiente contenido:
```json
[{ "name": "Ayla", "level": 4 }]
```
Inicia la API con `npm start` para consultarla manualmente en `GET /heroes`.
