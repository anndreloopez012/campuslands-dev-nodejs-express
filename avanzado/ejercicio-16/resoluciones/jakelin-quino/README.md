# Ejercicio 16: sanitización de entrada

## Propósito
Limpiar el nombre de un producto antes de incluirlo en el catálogo de ropa y sneakers.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /products` con `{"name":"  <b>Runner</b>  "}`:
```json
{ "name": "Runner" }
```
Se eliminan las etiquetas y los espacios al inicio y al final. Una entrada vacía responde `400`.
