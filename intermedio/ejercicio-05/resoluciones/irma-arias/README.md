# Ejercicio 05: Repositorio en memoria

## Propósito

Guardar equipos de fútbol sala en un repositorio independiente del servidor HTTP. El repositorio permite listar y crear registros durante la ejecución del proceso.

## Ejecución

Con Node.js 20 o superior, ejecuta `npm install` y `npm run dev`.

## Pruebas

- `GET /api/teams` lista los equipos.
- `POST /api/teams` recibe JSON como `{"name":"Halcones"}` y crea un equipo.
- El nombre es obligatorio; los datos desaparecen al detener el servidor.
