# Ejercicio 28: colección de ejemplos HTTP

## Propósito
Practicar consultas HTTP para listar y crear partidas battle royale. El archivo `requests.http` contiene las peticiones listas para probar.

## Ejecución y resultado esperado
Ejecuta `npm install` y `npm start`, luego abre `requests.http` con REST Client. `GET /matches` devuelve:
```json
[{ "id": 1, "map": "Valley" }]
```
`POST /matches` con `{"map":"Island"}` responde `201`:
```json
{ "id": 2, "map": "Island" }
```
