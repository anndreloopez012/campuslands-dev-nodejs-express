# Ejercicio 07: caché en memoria

## Propósito
Guardar temporalmente el catálogo de autos para reutilizarlo entre consultas durante un minuto.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`; consulta `GET /cars`:
```json
{ "source": "cache", "cars": [{ "name": "Aurora GT", "year": 2025 }] }
```
La primera respuesta indica `source: "catalog"` y las siguientes, mientras dure la caché, indican `source: "cache"`.
