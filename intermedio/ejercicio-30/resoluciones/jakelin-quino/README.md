# Ejercicio 30: proyecto integrador

## Propósito
Administrar una lista sencilla de motos de un taller. La API permite consultar registros y agregar motos después de validar el modelo y el año.

## Ejecución y resultados esperados
Ejecuta `npm install` y `npm start`. `GET /motos` devuelve:
```json
[{ "id": 1, "model": "Trail 250", "year": 2023 }]
```
Envía `POST /motos` con `{"model":"Racer","year":2024}`. La respuesta `201` será:
```json
{ "id": 2, "model": "Racer", "year": 2024 }
```
