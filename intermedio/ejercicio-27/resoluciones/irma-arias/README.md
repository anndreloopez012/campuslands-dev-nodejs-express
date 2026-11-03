# Ejercicio 27: Documentación de endpoints

## Propósito

Documentar de forma verificable una API de equipos MOBA. Cada endpoint indica método, ruta, parámetros, respuesta esperada y posibles errores.

## Ejecución

Requiere Node.js 20 o superior. Ejecuta `npm install` y `npm run dev`. El servidor usa el puerto `3000` por defecto; se puede cambiar con `PORT`.

## Referencia de la API

| Método | Ruta | Descripción | Respuesta |
|---|---|---|---|
| `GET` | `/api/teams` | Lista los equipos | `200` y arreglo `data` |
| `GET` | `/api/teams/:id` | Consulta un equipo por ID | `200`; `404` si no existe |
| `POST` | `/api/teams` | Crea un equipo | JSON `{"name":"Oráculos"}`; `201` o `400` |

## Ejemplos

`GET http://localhost:3000/api/teams`

`POST http://localhost:3000/api/teams` con `Content-Type: application/json` y cuerpo `{"name":"Oráculos"}`.
