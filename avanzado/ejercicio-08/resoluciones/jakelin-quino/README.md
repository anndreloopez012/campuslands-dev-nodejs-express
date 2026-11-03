# Ejercicio 08: EventEmitter

## Propósito
Emitir un evento cuando se registra un hiperdeportivo y reaccionar guardando una notificación.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /cars` con `{"model":"Veloce"}`:
```json
{ "model": "Veloce", "message": "Vehículo registrado" }
```
El evento crea la notificación. Consulta `GET /notifications` para ver los avisos guardados.
