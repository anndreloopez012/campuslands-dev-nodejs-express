# Ejercicio 20: idempotencia

## Propósito
Evitar que una misma solicitud de creación registre varias ilustraciones si se repite.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /artworks` con la cabecera `Idempotency-Key: dibujo-001` y el cuerpo `{"title":"Paisaje"}`:
```json
{ "id": 1, "title": "Paisaje" }
```
Al repetir la solicitud con la misma clave, se devuelve el mismo resultado sin crear otro registro.
