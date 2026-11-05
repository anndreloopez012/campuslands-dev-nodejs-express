# Intermedio 29 - refactor de API

API de futbol y futbol sala (equipos, partidos y tabla de posiciones) que muestra como se refactoriza una API: se conserva una version original de un solo archivo (`legacy/`), se reescribe por capas (`src/`) y las pruebas demuestran que el resultado es el mismo salvo los cambios que se hicieron a proposito.

## Que hace

- `legacy/app.legacy.js`: la API original, toda en un archivo, con respuestas inconsistentes.
- `src/`: la API refactorizada en rutas, controladores, servicios, dominio, validadores y repositorios.
- `test/equivalencia.test.js`: corre los mismos casos contra las dos versiones y compara los resultados.
- `test/legacy.test.js`: deja escrito como se comportaba la version original, incluidos sus defectos.

## Estructura

```text
.
|-- package.json
|-- README.md
|-- legacy/
|   `-- app.legacy.js
|-- soporte/
|   |-- cliente.js
|   `-- legacy.js
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- constants/
|   |-- controllers/
|   |-- data/
|   |-- domain/
|   |   `-- tabla.js
|   |-- middlewares/
|   |-- repositories/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   `-- validators/
`-- test/
```

## Como ejecutar

```bash
npm install
npm run dev
```

El servidor queda en `http://localhost:3000`. Para otro puerto: `PORT=4000 npm start` (en PowerShell: `$env:PORT=4000; npm start`).

## Como correr las pruebas

```bash
npm test
npm run test:cobertura
```

## Respuesta esperada

`GET /intermedio/ejercicio-29`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "refactor de API"
}
```

## Que cambio en el refactor

| Tema | Antes (legacy) | Despues (src) |
| --- | --- | --- |
| Estructura | Un solo archivo con todo mezclado | Rutas, controladores, servicios, dominio, validadores y repositorios |
| Calculo de la tabla | Bucles anidados dentro de la ruta | Funcion pura `calcularTabla` en `src/domain/tabla.js` |
| Constantes | 3, 1, nombres de modalidad escritos en varios lugares | `src/constants/futbol.js` |
| Errores | Siempre status 200 con `{ "error": "..." }` | 400, 404, 409, 415, 422 con `{ ok, message, codigo, errores }` |
| Respuestas | Objeto o arreglo suelto | `{ ok: true, data }`, listados con `paginacion` y `X-Total-Count` |
| Altas | 200 sin `Location` | 201 con `Location` |
| Validacion | Solo revisa que existan los campos | Tipos, rangos, campos desconocidos y formato del id |
| Goles | Acepta texto y negativos (la tabla se corrompe) | Enteros de 0 a 30 |
| Desempate | Puntos y diferencia de gol; luego orden de creacion | Puntos, diferencia, goles a favor y nombre |
| Metodos y rutas | Express responde con HTML | 405 con `Allow`, 404 y 415 en JSON |
| Pruebas | Ninguna | Dominio, servicios con dependencias falsas, API y equivalencia |

Lo que no cambio: las rutas, los nombres de los campos y los resultados de la tabla. La unica adicion en los datos es el campo `posicion` en la tabla.

### Orden en que se hizo

1. Escribir pruebas que describen la version original (`legacy.test.js`).
2. Extraer el calculo de la tabla a una funcion pura y probarla.
3. Separar rutas, controladores y servicios sin cambiar resultados.
4. Comparar ambas versiones con los mismos casos (`equivalencia.test.js`).
5. Corregir los defectos y dejar cada diferencia escrita en una prueba.

## Endpoints

| Metodo | Ruta | Descripcion | Exito |
| --- | --- | --- | --- |
| GET | `/intermedio/ejercicio-29` | Endpoint principal | 200 |
| GET | `/intermedio/ejercicio-29/equipos` | Lista equipos | 200 |
| POST | `/intermedio/ejercicio-29/equipos` | Crea un equipo | 201 |
| GET | `/intermedio/ejercicio-29/equipos/:id` | Detalle de un equipo | 200 |
| GET | `/intermedio/ejercicio-29/partidos` | Lista partidos | 200 |
| POST | `/intermedio/ejercicio-29/partidos` | Registra un partido | 201 |
| GET | `/intermedio/ejercicio-29/partidos/:id` | Detalle de un partido | 200 |
| GET | `/intermedio/ejercicio-29/tabla?modalidad=futbol` | Tabla de posiciones | 200 |

## Campos del body

Equipo (`POST /equipos`):

| Campo | Tipo | Regla |
| --- | --- | --- |
| nombre | texto | Obligatorio, 3 a 30 caracteres, unico sin importar mayusculas |
| modalidad | texto | Obligatorio: `futbol` o `futbol_sala` |

Partido (`POST /partidos`):

| Campo | Tipo | Regla |
| --- | --- | --- |
| localId | entero | Obligatorio, equipo existente |
| visitanteId | entero | Obligatorio, equipo existente, distinto del local y de la misma modalidad |
| golesLocal | entero | Obligatorio, de 0 a 30 |
| golesVisitante | entero | Obligatorio, de 0 a 30 |

Los campos desconocidos se rechazan con 400.

## Parametros de consulta

| Ruta | Parametro | Valores |
| --- | --- | --- |
| /equipos | modalidad | `futbol`, `futbol_sala` |
| /equipos | orden | `id` (por defecto), `nombre` |
| /partidos | equipoId | Entero: partidos donde juega ese equipo |
| /partidos | modalidad | `futbol`, `futbol_sala` |
| /partidos | orden | `id` (por defecto), `reciente` |
| /tabla | modalidad | Obligatorio: `futbol`, `futbol_sala` |
| listados | pagina, limite | pagina desde 1, limite de 1 a 50 (10 por defecto) |

## Ejemplos

curl:

```bash
curl "http://localhost:3000/intermedio/ejercicio-29/tabla?modalidad=futbol"

curl -X POST http://localhost:3000/intermedio/ejercicio-29/equipos \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Pumas","modalidad":"futbol"}'

curl -X POST http://localhost:3000/intermedio/ejercicio-29/partidos \
  -H "Content-Type: application/json" \
  -d '{"localId":1,"visitanteId":2,"golesLocal":3,"golesVisitante":1}'
```

PowerShell:

```powershell
Invoke-RestMethod "http://localhost:3000/intermedio/ejercicio-29/tabla?modalidad=futbol_sala"

Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-29/partidos `
  -ContentType "application/json" `
  -Body '{"localId":5,"visitanteId":6,"golesLocal":2,"golesVisitante":2}'
```

## Formato de respuesta

Exito:

```json
{ "ok": true, "data": { "id": 9, "nombre": "Pumas", "modalidad": "futbol" } }
```

Listados:

```json
{ "ok": true, "data": [], "paginacion": { "pagina": 1, "limite": 10, "total": 0, "totalPaginas": 1 } }
```

Tabla:

```json
{
  "ok": true,
  "data": [
    { "posicion": 1, "equipoId": 1, "nombre": "Leones", "pj": 2, "g": 2, "e": 0, "p": 0, "gf": 5, "gc": 2, "dg": 3, "pts": 6 }
  ]
}
```

## Errores

```json
{
  "ok": false,
  "message": "Los equipos son de modalidades distintas",
  "codigo": "MODALIDAD_DISTINTA"
}
```

| Status | Cuando | Codigo |
| --- | --- | --- |
| 400 | Body, id o parametros de consulta invalidos | VALIDACION, CONSULTA_INVALIDA, JSON_INVALIDO |
| 404 | Equipo, partido o ruta inexistente | EQUIPO_NO_ENCONTRADO, PARTIDO_NO_ENCONTRADO |
| 405 | Metodo no permitido (incluye cabecera `Allow`) | METODO_NO_PERMITIDO |
| 409 | Nombre de equipo repetido | EQUIPO_DUPLICADO |
| 413 | Body de mas de 10 KB | PAYLOAD_GRANDE |
| 415 | El body no es `application/json` | TIPO_NO_SOPORTADO |
| 422 | Equipo inexistente, mismo equipo o modalidades distintas en un partido | REFERENCIA_INVALIDA, MISMO_EQUIPO, MODALIDAD_DISTINTA |
