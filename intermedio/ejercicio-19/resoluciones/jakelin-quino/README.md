# Ejercicio 19: dotenv y configuración

## Propósito
Leer el puerto de ejecución desde un archivo de configuración para poder cambiarlo sin editar el programa.

## Ejecución y resultado esperado
Copia `.env.example` como `.env`, ejecuta `npm install` y `npm start`. Consulta `GET /config`:
```json
{ "port": 3000 }
```
Si configuras otro puerto en `.env`, la respuesta mostrará ese valor.
