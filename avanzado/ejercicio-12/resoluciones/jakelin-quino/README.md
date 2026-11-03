# Ejercicio 12: exportación JSON

## Propósito
Exportar reseñas de películas de miedo en un archivo con formato JSON.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Abre `GET /export/reviews`:
```json
[
  { "movie": "La noche", "rating": 5 },
  { "movie": "El sótano", "rating": 4 }
]
```
La respuesta se entrega como un archivo descargable llamado `reviews.json`.
