# Ejercicio 25: testing de integración

## Propósito
Probar la comunicación HTTP completa de una API de personajes RPG, incluyendo consulta y creación.

## Ejecución y resultado
Ejecuta `npm install` y `npm test`. Las pruebas verifican que `GET /heroes` devuelva el héroe de ejemplo y que `POST /heroes` cree uno nuevo.

La respuesta de creación para `{"name":"Ayla","class":"mage"}` es:
```json
{ "id": 2, "name": "Ayla", "class": "mage" }
```
Usa `npm start` para iniciar el servidor manualmente.
