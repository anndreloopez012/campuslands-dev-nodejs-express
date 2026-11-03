# Avanzado 26 - fixtures y factories (shooters competitivos)

API de un torneo de un shooter tactico 5v5 (estilo Valorant / CS): equipos, jugadores, partidas con marcador valido, elo, ranking y K/D. Lo importante del ejercicio es **como se preparan los datos de prueba**.

## Como ejecutar

```bash
npm install
npm start      # http://localhost:4026 (arranca con datos de ejemplo)
npm run seed   # muestra el ranking que generan las factories
npm test
```

## Fixtures vs factories

| | Fixture | Factory |
| - | ------- | ------- |
| Que es | un `.json` escrito a mano con un escenario exacto | una funcion que arma datos validos con valores por defecto |
| Donde | `test/fixtures/final-torneo.json` | `src/fabricas/index.js` |
| Cuando conviene | escenarios que no deben cambiar ("la final": Fenix 1720 vs Sombra 1580) | cuando a cada test solo le importan 1 o 2 campos |
| Problema | si cambia el modelo hay que editar todos los json | si se abusa de lo aleatorio, los tests son dificiles de leer |

### Fixture

`cargarFixture(almacen, ruta)` inserta en orden equipos -> jugadores -> partidas y respeta los ids del archivo, asi los tests pueden decir "el jugador 1 es nyx con 24 kills".

### Factories

```js
const f = crearFabricas(almacen, { semilla: 42 });

f.equipo.build();                      // solo arma el objeto, no lo guarda
f.equipo.create({ elo: 2000 });        // lo guarda; mis cambios ganan
f.equipo.create({}, "favorito");       // trait: elo 1800
f.jugador.create({}, "estrella");      // trait: duelista destacado
f.jugador.create();                    // asociacion: si no le paso equipo, crea uno
f.equipo.createList(10);
f.equipoCompleto();                    // equipo + 5 jugadores, 1 capitan
f.partidaBody({ rondasA: 13, rondasB: 4 });  // body valido para POST /api/partidas
```

- **Secuencias**: cada objeto lleva un numero, por eso los nombres nunca chocan.
- **Semilla**: el azar es un generador con semilla (mulberry32), con la misma semilla salen **siempre los mismos datos**. Si un test falla, falla igual la proxima vez.
- Las mismas factories se usan para la **semilla de desarrollo** (`src/semilla.js`).
- Los tests de las factories revisan que lo que fabrican sea valido (marcadores posibles, mapas que existen, roles correctos).

## Reglas del torneo

- Marcador valido: el ganador llega a 13 y el otro tiene 11 o menos (13-11), o hubo prorroga y se gana por 2 exactos (14-12, 15-13...).
- Elo con K = 32. Ranking por elo, luego victorias, luego nombre.
- Las estadisticas solo pueden ser de jugadores de los dos equipos de la partida.

## Endpoints

| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET | `/health` | estado |
| GET | `/api/equipos` | equipos |
| GET | `/api/equipos/:id` | equipo con jugadores |
| GET | `/api/ranking` | ranking por elo |
| GET | `/api/jugadores/:id/estadisticas` | kills, muertes y K/D |
| POST | `/api/partidas` | `{ equipoA, equipoB, mapa, rondasA, rondasB, estadisticas? }` |

```bash
curl localhost:4026/api/ranking
curl -X POST localhost:4026/api/partidas -H "Content-Type: application/json" \
  -d '{"equipoA":1,"equipoB":2,"mapa":"Haven","rondasA":14,"rondasB":12}'
```

## Estructura

```text
src/
├── app.js
├── server.js
├── semilla.js              datos de desarrollo con factories
├── datos/
│   ├── almacen.js          tablas en memoria
│   └── cargarFixture.js
├── fabricas/index.js       factories, traits, secuencias y semilla
└── servicios/torneo.js     marcador, elo, ranking, K/D
test/
├── fixtures/final-torneo.json
├── fabricas.test.js
└── torneo.test.js
```
