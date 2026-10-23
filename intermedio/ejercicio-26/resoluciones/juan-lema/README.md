# Ejercicio 26 - mock de dependencias (Juan Lema)

## Que hace

Tematica shooters competitivos. `POST /matches` crea una partida entre 2 y 10 jugadores: para calcular el nivel de la partida necesita el rank actual de cada jugador, y ese dato **no vive en esta API**, lo da una API externa de ranking. Esa llamada de red es la dependencia que hay que poder mockear.

- `services/ranking-client.js` es el unico que sabe hacer la llamada real (`fetch`). No se sube a produccion ninguna URL real: usa `RANKING_API_URL` o un dominio de ejemplo. Si lo arrancas con `npm start` sin esa variable, `POST /matches` va a fallar con `502 RANKING_UNAVAILABLE` porque el dominio de ejemplo no existe — eso es intencional, demuestra por que las pruebas no pueden depender de la red real.
- `services/matches.service.js` no conoce `fetch`: recibe un `rankingClient` por inyeccion de dependencias (`createMatchesService({ rankingClient, now })`), igual que recibe un reloj `now` en vez de usar `Date` directamente. Ambas son las dos dependencias que las pruebas reemplazan.
- Si el ranking no responde para algun jugador, la partida completa falla con `502 RANKING_UNAVAILABLE` (no se crea a medias). Un jugador sin historial (`404` en la API externa) es un caso valido: cuenta como `rank: null` y queda fuera del promedio.

## Tres formas de mockear la misma dependencia (las tres estan en las pruebas)

1. **Mockear `fetch` con `t.mock.method`** (`test/ranking-client.test.js`): se prueba la implementacion real de `ranking-client.js` sustituyendo `globalThis.fetch` por un doble, sin tocar la red.
2. **Inyeccion de dependencias con un doble escrito a mano** (`test/matches.service.test.js`): `matches.service.js` recibe un `rankingClient` falso (y un reloj falso) sin usar ninguna libreria de mocks — son solo objetos con las mismas funciones.
3. **Mockear a nivel de la app completa** (`test/matches.routes.test.js`): `createApp({ matches })` recibe un servicio ya armado con el `rankingClient` falso, y las pruebas de rutas HTTP tambien corren sin red, incluyendo el `502` cuando el "proveedor externo" fallara en produccion.

## Que se prueba (63 pruebas, 3 archivos)

- `test/ranking-client.test.js`: URL correcta, `404` -> `null`, rank invalido, error `500` de la API, fallo de red envuelto con un mensaje claro, y el mock de `globalThis.fetch` para el caso en que no se inyecta `fetchImpl`.
- `test/matches.service.test.js`: calculo de promedio y tier con datos que vienen del mock (nueve casos en los limites de cada tier), un jugador sin rank queda fuera del promedio, todos sin rank da `sin-clasificar`, un fallo del ranking se traduce a `502` y no consume el siguiente id, validacion completa del cuerpo (sin llegar a llamar al mock si falla antes), copias defensivas en `list`/`getById`, y que sin reloj inyectado se usa la hora real.
- `test/matches.routes.test.js`: creacion via HTTP con el mock, el `502` de la dependencia externa no filtra el mensaje real del error, la API sigue viva despues de ese fallo, `404`/`400` de rutas, y un `500` generico forzado inyectando un servicio roto (no la dependencia externa, un bug interno).

### Verificacion de la calidad de las pruebas

Cobertura: **100 %** de lineas, ramas y funciones en `src/` y en el cliente HTTP de pruebas. Se rompio la aplicacion a proposito de 24 formas (ignorar el `404` de la API externa, no validar el rank recibido, no envolver un fallo de red, invertir el filtro de ranks nulos, aceptar un solo jugador, devolver el objeto interno en vez de una copia, dejar de traducir el `502`, filtrar el mensaje de un `500`...): **24 de 24** hicieron fallar al menos una prueba.

## Como ejecutar

```bash
npm install
npm start
```

Con una URL de ranking real (opcional, no requerido para el desarrollo):

```bash
RANKING_API_URL=https://tu-api-de-ranking.example npm start
```

## Como ejecutar las pruebas

```bash
npm test
npm run test:coverage
node --test test/ranking-client.test.js
```

Las pruebas nunca hacen una peticion de red real: no necesitan `RANKING_API_URL` ni conexion a internet. Verificado con Node 24; requiere Node 20 o superior.

## Como probar la API

```bash
curl http://localhost:4026/matches
curl -X POST http://localhost:4026/matches -H "Content-Type: application/json" -d "{\"mapName\":\"Arena Cruce\",\"players\":[1,2]}"
curl http://localhost:4026/matches/1
```

Sin `RANKING_API_URL` configurada con un servidor real, el `POST` anterior responde `502 RANKING_UNAVAILABLE` (la API de ejemplo no existe) — es el comportamiento esperado y el motivo del ejercicio.

## Como probar los casos de error

```bash
curl -X POST http://localhost:4026/matches -H "Content-Type: application/json" -d "{\"mapName\":\"Base Lunar\",\"players\":[1,2]}"
curl -X POST http://localhost:4026/matches -H "Content-Type: application/json" -d "{\"mapName\":\"Arena Cruce\",\"players\":[1,1]}"
curl http://localhost:4026/matches/99
curl http://localhost:4026/matches/abc
```

## Estructura

```text
src/
├── app.js
├── server.js
├── errors.js
├── routes/matches.routes.js
├── controllers/matches.controller.js
├── services/
│   ├── ranking-client.js
│   └── matches.service.js
└── middlewares/error-handler.js
test-support/
└── client.js
test/
├── ranking-client.test.js
├── matches.service.test.js
└── matches.routes.test.js
```
