# Ejercicio 27: documentación de endpoints

## Propósito
Describir las operaciones disponibles para consultar y registrar equipos MOBA.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`. Consulta `GET /docs` para recibir:
```json
[
  { "method": "GET", "path": "/teams", "description": "Lista equipos MOBA" },
  { "method": "POST", "path": "/teams", "description": "Registra un equipo" }
]
```
`GET /teams` muestra los equipos existentes; `POST /teams` recibe un nombre y devuelve el equipo creado con estado `201`.
