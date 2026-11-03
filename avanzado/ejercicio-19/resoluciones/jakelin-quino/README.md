# Ejercicio 19: auditoría de acciones

## Propósito
Registrar las acciones de creación de citas en un estudio de tatuajes.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /appointments` con `{"client":"Ana","design":"Flor"}`:
```json
{ "id": 1, "client": "Ana", "design": "Flor" }
```
Consulta `GET /audit` para ver quién realizó la acción, cuál fue y cuándo ocurrió.
