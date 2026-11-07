# INTERMEDIO 02 - Routers modulares

## Objetivo

Crear una API Node.js con Express donde cada dominio del negocio tenga su propio router, controlador y servicio, montados en prefijos independientes.

## Concepto principal

Un `Router` de Express agrupa endpoints de un dominio y se monta en la app con un prefijo:

```js
app.use('/maps', mapsRoutes);
app.use('/matches', matchesRoutes);
```

Cada router vive en su propio archivo dentro de `src/routes/`, lo que evita un `app.js` gigante y permite que varios desarrolladores trabajen en paralelo. El router se define internamente con rutas relativas (`/`, `/:id`) y el prefijo real se decide al montarlo.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   ├── maps.routes.js
    │   └── matches.routes.js
    ├── controllers/
    │   ├── maps.controller.js
    │   └── matches.controller.js
    └── services/
        ├── maps.service.js
        └── matches.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Endpoints

| Metodo | Ruta | Descripcion | Codigo |
| ------ | ---- | ----------- | ------ |
| GET | /health | Verifica el estado del servidor | 200 |
| GET | /maps | Lista todos los mapas | 200 |
| GET | /maps/:id | Obtiene un mapa por id | 200 / 404 |
| POST | /maps | Crea un mapa | 201 / 400 |
| GET | /matches | Lista todas las partidas | 200 |
| GET | /matches/:id | Obtiene la partida junto con su mapa | 200 / 404 |
| POST | /matches | Crea una partida sobre un mapa existente | 201 / 400 |

## Ejemplos de peticiones

```bash
# Listar mapas
curl http://localhost:3000/maps

# Crear mapa
curl -X POST http://localhost:3000/maps \
  -H "Content-Type: application/json" \
  -d '{"name": "Puerto Eterno", "modo": "dm", "maxJugadores": 6}'

# Crear partida (mapId debe existir, validacion cruzada entre dominios)
curl -X POST http://localhost:3000/matches \
  -H "Content-Type: application/json" \
  -d '{"mapId": 1, "titulo": "Ranked Dia 3", "estado": "programada", "fecha": "2026-11-12T21:00:00.000Z"}'

# Caso de error: mapId inexistente (responde 400)
curl -X POST http://localhost:3000/matches \
  -H "Content-Type: application/json" \
  -d '{"mapId": 999, "titulo": "Partida Fantasma", "estado": "programada", "fecha": "2026-11-12T21:00:00.000Z"}'

# Detalle de partida con el mapa embebido
curl http://localhost:3000/matches/1
```

## Decisiones de diseno

- Cada dominio (`maps`, `matches`) tiene sus tres capas completas y aisladas.
- `matches.service` no importa al servicio de mapas: recibe el servicio por parametro inyectado por el controlador, manteniendo el acoplamiento minimo.
- El detalle de partida enriquece la respuesta con el mapa consultado.
