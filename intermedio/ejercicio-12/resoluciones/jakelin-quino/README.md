# Ejercicio 12: subrecursos REST

## Propósito
Consultar las reseñas asociadas a una película específica.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Consulta `GET /movies/1/reviews`:
```json
["Da mucho miedo", "Buen suspenso"]
```
La respuesta es una lista de reseñas. Si no existe una película con ese identificador, la API responde `404`.
