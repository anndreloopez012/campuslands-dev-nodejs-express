# Ejercicio 06: colas de tareas conceptuales

## Propósito
Agregar trabajos de mantenimiento de motos a una cola en memoria para procesarlos en orden.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /jobs` con `{"task":"Cambiar aceite"}`:
```json
{ "id": 1, "task": "Cambiar aceite", "status": "queued" }
```
La respuesta confirma que el trabajo quedó en cola. Consulta `GET /jobs` para ver su estado, que cambia a `completed` cuando se procesa. La cola se reinicia al detener el servidor.
