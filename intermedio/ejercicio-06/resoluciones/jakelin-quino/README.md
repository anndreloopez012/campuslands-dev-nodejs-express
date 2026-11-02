# Ejercicio 06: validación centralizada

## Propósito
Comprobar los datos de una moto antes de aceptarla. Se requiere un modelo y un año entero igual o posterior a 1900.

## Ejecución y prueba
Ejecuta `npm install` y `npm start`. Envía `POST /motos` con `{"model":"Racer","year":2024}`.

## Resultado esperado
Con datos válidos, la API responde `201` y devuelve el registro:
```json
{ "model": "Racer", "year": 2024 }
```
Si los datos no son válidos, responde `400` y explica que falta un modelo o un año válido.
