# Ejercicio 03: Controladores limpios

## Propósito

Exponer información de partidas MOBA mediante un controlador. El controlador se limita a traducir la solicitud HTTP y enviar la respuesta; la lista de partidas se mantiene fuera de él.

## Ejecución

Con Node.js 20 o superior, ejecuta `npm install` y `npm run dev`.

## Pruebas

- `GET http://localhost:3000/api/matches` devuelve las partidas disponibles.
- `GET http://localhost:3000/api/matches/1` devuelve una partida.
- Un identificador inexistente produce estado `404`.
