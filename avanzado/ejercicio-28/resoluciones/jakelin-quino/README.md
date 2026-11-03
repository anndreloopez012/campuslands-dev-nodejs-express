# Ejercicio 28: separación app y server

## Propósito
Mantener la aplicación battle royale separada del archivo que abre el puerto. Esto permite probar sus rutas sin iniciar un servidor fijo.

## Ejecución y resultado
Ejecuta `npm install` y `npm test`. La prueba verifica que `GET /matches` responda:
```json
[{ "id": 1, "map": "Island" }]
```
Para iniciar el servidor, ejecuta `npm start` y consulta `GET http://localhost:3000/matches`.
