# Ejercicio 24: documentación OpenAPI manual

## Propósito
Describir una API de fórmulas químicas usando un documento OpenAPI escrito manualmente.

## Ejecución y resultado
Ejecuta `npm install` y `npm start`. Consulta `GET /openapi.json` para recibir el documento:
```json
{
  "openapi": "3.0.0",
  "info": { "title": "API de fórmulas", "version": "1.0.0" },
  "paths": {
    "/formulas/{formula}": {
      "get": {
        "summary": "Calcula una fórmula química",
        "responses": { "200": { "description": "Masa calculada" } }
      }
    }
  }
}
```
La ruta `/formulas/H2O` devuelve la fórmula y su masa calculada.
