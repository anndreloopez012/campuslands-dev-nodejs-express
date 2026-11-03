# Ejercicio 09: paginación y filtros

## Propósito
Filtrar peleadores por categoría y presentar los resultados por páginas de dos elementos.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Consulta `GET /fighters?page=1&category=ligero`:
```json
{
  "page": 1,
  "results": [
    { "name": "Luna", "category": "ligero" },
    { "name": "Mar", "category": "ligero" }
  ],
  "total": 2
}
```
`total` indica cuántos peleadores cumplen el filtro.
