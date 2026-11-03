# Avanzado 25 - testing de integracion (videojuegos RPG)

API de un RPG (crear personajes, equiparlos y pelear contra monstruos) que guarda la partida en un **archivo JSON real**. Lo importante del ejercicio son los **tests de integracion**: prueban todo el camino `HTTP -> rutas -> servicio -> repositorio -> disco` sin mocks.

## Como ejecutar

```bash
npm install
npm start                  # http://localhost:4025 (guarda en data/partida.json)
npm test                   # todos
npm run test:unit          # solo reglas puras
npm run test:integracion   # solo integracion
```

## Unitarios vs integracion

| | `test/unit/` | `test/integracion/` |
| - | ------------ | ------------------- |
| Que prueba | funciones puras de `src/juego/reglas.js` (xp, dano, pelea) | la app completa con supertest |
| Archivos | no toca disco | escribe y lee un JSON de verdad |
| Velocidad | muy rapido | un poco mas lento |
| Detecta | errores de logica | errores de "pegamento": rutas, status, persistencia, concurrencia |

## Como estan armados los tests de integracion

- **Aislamiento**: `test/integracion/preparar.js` crea una carpeta temporal (`mkdtemp`) por cada test en el `beforeEach`, y el `afterEach` la borra. Ningun test ve los datos de otro ni toca `data/`.
- **Inyeccion**: `crearApp({ carpetaDatos, aleatorio })`. El dado se fija en `() => 0` para que las peleas den siempre lo mismo.
- **Que se prueba**:
  - flujo completo: crear, equipar, pelear contra slime y lobo, subir a nivel 2, y revisar que el **archivo en disco** tenga lo mismo que dijo la API
  - **reinicio**: una app nueva sobre la misma carpeta ve los datos
  - **15 creaciones en paralelo**: ninguna se pierde, ids sin repetir, sin `.tmp` tirados
  - **carrera de nombres**: dos "Gimli" al mismo tiempo -> 201 y 409
  - **archivo danado** -> 500 con mensaje claro y la app se recupera
  - validaciones (400, 404, 409, 422) y que un 400 no escriba nada en disco

## Repositorio en archivo (`src/repositorio/archivoJson.js`)

- Escritura **atomica**: escribe `partida.json.<pid>.tmp` y despues `rename`.
- **Fila de escrituras**: cada `modificar()` espera al anterior (leer -> cambiar -> guardar), por eso las peticiones en paralelo no se pisan.
- Si falla un trabajo, la fila sigue para los demas.

## Endpoints

| Metodo | Ruta | Body |
| ------ | ---- | ---- |
| GET | `/health` | |
| GET | `/api/personajes` | |
| GET | `/api/personajes/:id` | |
| POST | `/api/personajes` | `{ "nombre": "Aragorn", "clase": "guerrero" }` (guerrero, mago, arquero) |
| POST | `/api/personajes/:id/equipo` | `{ "objeto": "espada-larga" }` (maximo 2, segun la clase) |
| POST | `/api/personajes/:id/batallas` | `{ "monstruo": "slime" }` (slime, lobo, golem) |

```bash
curl -X POST localhost:4025/api/personajes -H "Content-Type: application/json" -d '{"nombre":"Aragorn","clase":"guerrero"}'
curl -X POST localhost:4025/api/personajes/1/equipo -H "Content-Type: application/json" -d '{"objeto":"espada-larga"}'
curl -X POST localhost:4025/api/personajes/1/batallas -H "Content-Type: application/json" -d '{"monstruo":"lobo"}'
```

## Estructura

```text
src/
├── app.js
├── server.js
├── juego/reglas.js              clases, objetos, monstruos, xp y pelea (puro)
├── servicios/personajes.js      casos de uso
└── repositorio/archivoJson.js   guardado atomico en fila
test/
├── unit/reglas.test.js
└── integracion/
    ├── preparar.js              carpeta temporal por test
    └── personajes.test.js
```
