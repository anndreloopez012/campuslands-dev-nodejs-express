# Ejercicio 11: búsqueda textual

## Propósito
Buscar canciones por una parte de su título. La búsqueda no distingue entre mayúsculas y minúsculas.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Consulta `GET /songs?q=night`:
```json
["Midnight Road", "Night Drive"]
```
La respuesta contiene únicamente los títulos que incluyen el texto indicado.
