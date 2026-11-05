# Intermedio 28 - coleccion de ejemplos HTTP

API de un battle royale (jugadores y partidas) acompanada de una coleccion de ejemplos HTTP lista para usar en VS Code, Postman, PowerShell y bash.

## Que hace

- Expone una API con jugadores, partidas, eliminaciones y resultados.
- Incluye una coleccion de 26 ejemplos (casos felices y errores) que se encadenan: crean jugadores, arman una partida, la juegan hasta que hay un ganador y luego muestran los errores mas comunes.
- Los 4 formatos se generan desde un solo catalogo (`src/ejemplos/catalogo.js`), asi nunca se contradicen.
- Las pruebas ejecutan el catalogo contra la API y verifican que los archivos guardados esten al dia.

## Estructura

```text
.
|-- package.json
|-- README.md
|-- ejemplos/
|   |-- battle-royale.http
|   |-- battle-royale.postman_collection.json
|   |-- battle-royale.ps1
|   `-- battle-royale.sh
|-- scripts/
|   |-- generar-ejemplos.js
|   `-- probar-ejemplos.js
|-- soporte/
|   `-- cliente.js
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- constants/
|   |-- controllers/
|   |-- data/
|   |-- ejemplos/
|   |   |-- catalogo.js
|   |   |-- ejecutor.js
|   |   |-- plantilla.js
|   |   |-- archivos.js
|   |   |-- introspeccion.js
|   |   `-- formatos/
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

`GET /intermedio/ejercicio-28`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "coleccion de ejemplos HTTP"
}
```

## Como usar la coleccion de ejemplos

Primero deja el servidor corriendo con `npm run dev`. Despues elige uno de estos formatos (todos usan la URL `http://localhost:3000/intermedio/ejercicio-28`):

| Formato | Archivo | Como usarlo |
| --- | --- | --- |
| VS Code | `ejemplos/battle-royale.http` | Instala la extension REST Client, abre el archivo y pulsa "Send Request" sobre cada peticion, de arriba hacia abajo |
| Postman | `ejemplos/battle-royale.postman_collection.json` | Import, luego Run collection. Cada peticion revisa su status y guarda los ids |
| PowerShell | `ejemplos/battle-royale.ps1` | `powershell -ExecutionPolicy Bypass -File ejemplos/battle-royale.ps1` |
| bash | `ejemplos/battle-royale.sh` | `bash ejemplos/battle-royale.sh` |

Los scripts aceptan otra URL base como argumento, por ejemplo `bash ejemplos/battle-royale.sh http://localhost:4000/intermedio/ejercicio-28`.

Tambien puedes probar todos los ejemplos con Node, sin instalar nada mas:

```bash
npm run ejemplos:probar
```

Imprime una linea por ejemplo con `OK` o `FALLO` y termina con codigo 1 si alguno no responde lo esperado. Acepta una URL base: `npm run ejemplos:probar -- http://localhost:4000/intermedio/ejercicio-28`.

Si cambias el catalogo, regenera los archivos con:

```bash
npm run ejemplos:generar
```

La prueba `ejemplos.archivos.test.js` falla si los archivos guardados no coinciden con el catalogo.

### Orden de los ejemplos

1. Sistema: endpoint principal.
2. Jugadores: listar, crear A, B y C, ver detalle, buscar por nick.
3. Partidas: crear, unir a los tres, retirar y volver a unir a C, ver, iniciar, eliminar a C y a B (gana A), ver resultados, listar finalizadas.
4. Errores: 400 (datos invalidos), 400 (id invalido), 404, 409 (nick repetido), 409 (partida cerrada), 405, 415.

Los nicks llevan un numero aleatorio para poder repetir la coleccion sin chocar con el 409 de nick duplicado.

## Endpoints

| Metodo | Ruta | Descripcion | Exito |
| --- | --- | --- | --- |
| GET | `/intermedio/ejercicio-28` | Endpoint principal | 200 |
| GET | `/intermedio/ejercicio-28/jugadores` | Lista jugadores | 200 |
| POST | `/intermedio/ejercicio-28/jugadores` | Crea un jugador | 201 |
| GET | `/intermedio/ejercicio-28/jugadores/:id` | Detalle de un jugador | 200 |
| GET | `/intermedio/ejercicio-28/partidas` | Lista partidas | 200 |
| POST | `/intermedio/ejercicio-28/partidas` | Crea una partida | 201 |
| GET | `/intermedio/ejercicio-28/partidas/:id` | Detalle de una partida | 200 |
| POST | `/intermedio/ejercicio-28/partidas/:id/jugadores` | Une un jugador | 201 |
| DELETE | `/intermedio/ejercicio-28/partidas/:id/jugadores/:jugadorId` | Retira un jugador antes de empezar | 200 |
| POST | `/intermedio/ejercicio-28/partidas/:id/iniciar` | Inicia la partida | 200 |
| POST | `/intermedio/ejercicio-28/partidas/:id/eliminaciones` | Registra una eliminacion | 200 |
| GET | `/intermedio/ejercicio-28/partidas/:id/resultados` | Tabla de posiciones | 200 |

## Campos del body

Jugador (`POST /jugadores`):

| Campo | Tipo | Regla |
| --- | --- | --- |
| nick | texto | Obligatorio, 3 a 16 caracteres, solo letras, numeros y guion bajo, unico sin importar mayusculas |
| region | texto | Obligatorio: `na`, `eu`, `latam`, `asia` |

Partida (`POST /partidas`):

| Campo | Tipo | Regla |
| --- | --- | --- |
| mapa | texto | Obligatorio: `isla`, `desierto`, `artico` |
| cupos | entero | Obligatorio, de 2 a 10 |

Unirse (`POST /partidas/:id/jugadores`): `jugadorId` entero obligatorio.

Eliminacion (`POST /partidas/:id/eliminaciones`): `eliminadoId` entero obligatorio y `eliminadorId` entero opcional (sin eliminador, por ejemplo cuando lo elimina la zona).

Los campos desconocidos se rechazan con 400.

## Parametros de consulta

| Ruta | Parametro | Valores |
| --- | --- | --- |
| /jugadores | region | `na`, `eu`, `latam`, `asia` |
| /jugadores | buscar | Parte del nick, de 1 a 16 caracteres |
| /jugadores | orden | `id`, `nick`, `victorias`, `kills` |
| /partidas | estado | `esperando`, `en_curso`, `finalizada` |
| /partidas | mapa | `isla`, `desierto`, `artico` |
| /partidas | orden | `reciente` (por defecto), `id` |
| ambas | pagina, limite | pagina desde 1, limite de 1 a 50 (10 por defecto) |

## Ejemplos

curl:

```bash
curl http://localhost:3000/intermedio/ejercicio-28/jugadores?region=latam&orden=kills

curl -X POST http://localhost:3000/intermedio/ejercicio-28/jugadores \
  -H "Content-Type: application/json" \
  -d '{"nick":"Allison_BR","region":"latam"}'

curl -X POST http://localhost:3000/intermedio/ejercicio-28/partidas \
  -H "Content-Type: application/json" \
  -d '{"mapa":"isla","cupos":3}'
```

PowerShell:

```powershell
Invoke-RestMethod http://localhost:3000/intermedio/ejercicio-28/jugadores

Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-28/jugadores `
  -ContentType "application/json" `
  -Body '{"nick":"Allison_BR","region":"latam"}'

Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-28/partidas/3/iniciar
```

## Formato de respuesta

Exito:

```json
{ "ok": true, "data": { "id": 9, "nick": "Allison_BR", "region": "latam", "partidas": 0, "victorias": 0, "kills": 0, "creadoEn": "2026-11-04T12:00:00.000Z" } }
```

Listados:

```json
{ "ok": true, "data": [], "paginacion": { "pagina": 1, "limite": 10, "total": 0, "totalPaginas": 1 } }
```

Los listados tambien envian la cabecera `X-Total-Count`. Las creaciones envian `Location`.

Eliminacion:

```json
{ "ok": true, "data": { "eliminadoId": 2, "posicion": 2, "restantes": 1, "finalizada": true, "ganadorId": 1 } }
```

## Errores

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "codigo": "VALIDACION",
  "errores": [{ "campo": "nick", "mensaje": "debe tener entre 3 y 16 caracteres" }]
}
```

| Status | Cuando | Codigo |
| --- | --- | --- |
| 400 | Body, id o parametros de consulta invalidos | VALIDACION, CONSULTA_INVALIDA |
| 404 | Jugador, partida o ruta inexistente | JUGADOR_NO_ENCONTRADO, PARTIDA_NO_ENCONTRADA, JUGADOR_NO_EN_PARTIDA |
| 405 | Metodo no permitido (incluye cabecera `Allow`) | METODO_NO_PERMITIDO |
| 409 | Nick repetido, partida llena o cerrada, jugador ocupado o ya eliminado, faltan jugadores | NICK_DUPLICADO, PARTIDA_LLENA, PARTIDA_CERRADA, JUGADOR_OCUPADO, JUGADOR_YA_ELIMINADO, JUGADORES_INSUFICIENTES, PARTIDA_NO_EN_CURSO, PARTIDA_NO_FINALIZADA |
| 415 | El body no es `application/json` | TIPO_NO_SOPORTADO |
| 422 | Jugador inexistente al unir o eliminar, o eliminacion a si mismo | REFERENCIA_INVALIDA, ELIMINACION_INVALIDA |
