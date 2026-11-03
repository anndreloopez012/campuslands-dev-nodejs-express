# Ejercicio 11: importación masiva

## Propósito
Registrar varias canciones en una sola petición. Cada elemento necesita título y artista.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Envía `POST /songs/import`:
```json
{ "songs": [{ "title": "Luz", "artist": "Sol" }, { "title": "Mar", "artist": "Luna" }] }
```
La API responde `201` con la cantidad importada y los datos recibidos. Si una canción está incompleta, devuelve `400`.
