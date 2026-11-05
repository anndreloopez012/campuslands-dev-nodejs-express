# Avanzado 04 - errores de dominio

API de un battle royale (jugadores, partidas, botin, combate y zona que se cierra) donde el foco son los **errores de dominio**: como nacen en las reglas del juego, como se nombran y como se traducen a respuestas HTTP claras.

Tematica: battle royale. Ruta base: `/avanzado/ejercicio-04`.

## Ejecutar

```bash
npm install
npm start
npm test
```

El servidor usa el puerto `3000` o el de la variable `PORT`.

## Idea de diseno

- **El dominio no sabe de HTTP.** `src/domain/` contiene las reglas (`Partida`) y sus errores. Nada ahi menciona `express`, `req`, `res` ni codigos de estado; una prueba lo comprueba leyendo los archivos.
- **Un error de dominio es una regla rota, con nombre.** Cada uno tiene un `codigo` estable (`PARTIDA_LLENA`), una `categoria`, un mensaje generado y un `contexto` con los datos que explican el fallo (`{ inscritos: 4, capacidad: 4 }`).
- **Un catalogo unico.** `src/domain/errores/catalogo.js` define cada codigo una sola vez: clase, titulo, mensaje, sugerencia y si es reintentable. El dominio los lanza con `crear('CODIGO', contexto)`. Si se escribe un codigo que no existe, falla con `TypeError`.
- **Cinco categorias, un estado HTTP por categoria.** La traduccion vive en un solo lugar (`src/http/problemas.js`), asi que un error nuevo no necesita tocar rutas ni middlewares.
- **Respuestas `application/problem+json`** (RFC 9457), con `type`, `title`, `status`, `detail`, `instance`, mas `codigo`, `categoria`, `sugerencia`, `contexto` e `idPeticion`.
- **Los errores esperados se explican; los inesperados se esconden.** Un bug responde `500` generico (`ERROR_INTERNO`) con el `idPeticion`, y el detalle real (mensaje y pila) va solo al registro del servidor.
- **La causa no sale a la calle.** Un error de dominio puede guardar la excepcion original en `cause`, pero nunca se serializa.
- **Un error tambien puede ser un dato.** En el lote de acciones, cada fallo de dominio se devuelve como un problema dentro del resultado, sin cortar el resto. Los errores inesperados no se capturan ahi: suben como `500`.

### Categorias

| Categoria | Estado | Cuando se usa |
| --- | --- | --- |
| `no_encontrado` | 404 | La entidad referida no existe |
| `conflicto` | 409 | Choca con algo que ya existe o con un limite |
| `estado_invalido` | 409 | La accion no aplica al estado actual (partida terminada, jugador eliminado) |
| `regla_de_negocio` | 422 | La peticion es valida pero la regla del juego la impide |
| `permiso` | 403 | El jugador no puede hacerlo (suspendido, no participa) |

Errores del borde HTTP (no son de dominio, categoria `http`): `VALIDACION` 400, `JSON_INVALIDO` 400, `RUTA_NO_ENCONTRADA` 404, `CODIGO_DESCONOCIDO` 404, `METODO_NO_PERMITIDO` 405, `PAYLOAD_GRANDE` 413, `TIPO_NO_SOPORTADO` 415 y `ERROR_INTERNO` 500.

### Codigos de dominio

| Codigo | Estado | Categoria | Titulo |
| --- | --- | --- | --- |
| `JUGADOR_NO_ENCONTRADO` | 404 | no_encontrado | Jugador no encontrado |
| `PARTIDA_NO_ENCONTRADA` | 404 | no_encontrado | Partida no encontrada |
| `OBJETO_NO_ENCONTRADO` | 404 | no_encontrado | Objeto no encontrado |
| `NICK_EN_USO` | 409 | conflicto | Nick en uso |
| `JUGADOR_YA_INSCRITO` | 409 | conflicto | Jugador ya inscrito |
| `JUGADOR_EN_OTRA_PARTIDA` | 409 | conflicto | Jugador en otra partida |
| `PARTIDA_LLENA` | 409 | conflicto | Partida llena |
| `OBJETO_YA_RECOGIDO` | 409 | conflicto | Objeto ya recogido |
| `ARMA_REPETIDA` | 409 | conflicto | Arma repetida |
| `INVENTARIO_LLENO` | 409 | conflicto | Inventario lleno |
| `ESCUDO_COMPLETO` | 409 | conflicto | Escudo completo |
| `MUNICION_LLENA` | 409 | conflicto | Municion llena |
| `VIDA_COMPLETA` | 409 | conflicto | Vida completa |
| `PARTIDA_NO_ABIERTA` | 409 | estado_invalido | Partida no abierta |
| `PARTIDA_NO_EN_CURSO` | 409 | estado_invalido | Partida no iniciada |
| `PARTIDA_TERMINADA` | 409 | estado_invalido | Partida terminada |
| `JUGADOR_ELIMINADO` | 409 | estado_invalido | Jugador eliminado |
| `OBJETIVO_ELIMINADO` | 409 | estado_invalido | Objetivo eliminado |
| `ZONA_FINAL` | 409 | estado_invalido | Zona final |
| `JUGADOR_NO_PARTICIPA` | 403 | permiso | Jugador fuera de la partida |
| `JUGADOR_SUSPENDIDO` | 403 | permiso | Jugador suspendido |
| `JUGADORES_INSUFICIENTES` | 422 | regla_de_negocio | Jugadores insuficientes |
| `FUERA_DE_MAPA` | 422 | regla_de_negocio | Fuera del mapa |
| `MOVIMIENTO_DEMASIADO_LARGO` | 422 | regla_de_negocio | Movimiento demasiado largo |
| `OBJETO_LEJOS` | 422 | regla_de_negocio | Objeto fuera de alcance |
| `AUTO_ATAQUE` | 422 | regla_de_negocio | Auto ataque |
| `SIN_ARMA` | 422 | regla_de_negocio | Sin arma |
| `ARMA_NO_EQUIPADA` | 422 | regla_de_negocio | Arma no equipada |
| `SIN_MUNICION` | 422 | regla_de_negocio | Sin municion |
| `FUERA_DE_ALCANCE` | 422 | regla_de_negocio | Objetivo fuera de alcance |
| `SIN_BOTIQUIN` | 422 | regla_de_negocio | Sin botiquin |

El catalogo tambien se consulta en vivo con `GET /errores`.

## Reglas del juego

- Mapa de 100 x 100. Cada jugador empieza con 100 de vida, 6 balas y 4 espacios de inventario.
- Una partida pasa por `abierta`, `en_curso` y `terminada`. Solo se puede unir o salir mientras esta abierta, y iniciar exige el minimo de jugadores.
- Un jugador no puede estar en dos partidas activas ni si esta suspendido.
- Un paso de movimiento mide como maximo 15; se recoge a 3 o menos de distancia.
- Pistola: dano 20, alcance 30. Rifle: dano 30, alcance 60. El escudo (maximo 50) absorbe antes que la vida.
- El botiquin cura 40 y ocupa un espacio; el escudo y la municion se aplican al recogerlos.
- La zona tiene 5 fases (radio 50, 35, 22, 12, 5). Al avanzar, quien queda fuera pierde `10 x (fase - 1)` de vida.
- Gana el ultimo jugador con vida.

## Rutas

| Ruta | Descripcion |
| --- | --- |
| `GET /` | Respuesta base del ejercicio |
| `GET /errores` | Catalogo de errores; filtros `categoria`, `origen`, `buscar` |
| `GET /errores/:codigo` | Detalle de un codigo (es la URL del campo `type`) |
| `GET /jugadores` | Lista; filtro `buscar`, `pagina`, `limite` |
| `GET /jugadores/:id` | Detalle |
| `POST /jugadores` | Registrar jugador `{ "nick": "Phantom_01" }` |
| `GET /partidas` | Lista; filtro `estado`, `pagina`, `limite` |
| `GET /partidas/:id` | Detalle con jugadores, zona y botin |
| `POST /partidas` | Crear `{ "nombre", "capacidad", "minimo" }` |
| `POST /partidas/:id/unirse` | `{ "jugadorId" }` |
| `POST /partidas/:id/salir` | `{ "jugadorId" }` |
| `POST /partidas/:id/iniciar` | Inicia la partida |
| `POST /partidas/:id/mover` | `{ "jugadorId", "x", "y" }` |
| `POST /partidas/:id/recoger` | `{ "jugadorId", "objetoId" }` |
| `POST /partidas/:id/disparar` | `{ "atacanteId", "objetivoId", "arma"? }` |
| `POST /partidas/:id/curar` | `{ "jugadorId" }` |
| `POST /partidas/:id/zona/avanzar` | Cierra la zona una fase |
| `POST /partidas/:id/acciones` | Lote de hasta 20 acciones (`mover`, `recoger`, `disparar`, `curar`) |
| `GET /partidas/:id/eventos` | Historial de lo ocurrido |

## Ejemplos

Unirse a una partida suspendido (`403`):

```bash
curl -i -X POST http://localhost:3000/avanzado/ejercicio-04/partidas/1/unirse \
  -H "Content-Type: application/json" -d '{"jugadorId": 8}'
```

```json
{
  "type": "/avanzado/ejercicio-04/errores/JUGADOR_SUSPENDIDO",
  "title": "Jugador suspendido",
  "status": 403,
  "detail": "El jugador 8 esta suspendido y no puede unirse a partidas",
  "instance": "/avanzado/ejercicio-04/partidas/1/unirse",
  "codigo": "JUGADOR_SUSPENDIDO",
  "categoria": "permiso",
  "reintentable": false,
  "sugerencia": "Contacta a soporte para revisar la suspension",
  "contexto": { "jugadorId": 8 },
  "idPeticion": "82149aa7-836e-41ad-8498-a705bd4825ab"
}
```

Flujo de una partida:

```bash
curl -X POST http://localhost:3000/avanzado/ejercicio-04/partidas/1/unirse -H "Content-Type: application/json" -d '{"jugadorId": 1}'
curl -X POST http://localhost:3000/avanzado/ejercicio-04/partidas/1/unirse -H "Content-Type: application/json" -d '{"jugadorId": 2}'
curl -X POST http://localhost:3000/avanzado/ejercicio-04/partidas/1/iniciar
curl -X POST http://localhost:3000/avanzado/ejercicio-04/partidas/1/recoger -H "Content-Type: application/json" -d '{"jugadorId": 1, "objetoId": 1}'
curl -X POST http://localhost:3000/avanzado/ejercicio-04/partidas/1/zona/avanzar
```

Lote de acciones; las que fallan vuelven como problema dentro de `resultados` y las demas se ejecutan:

```bash
curl -X POST http://localhost:3000/avanzado/ejercicio-04/partidas/1/acciones \
  -H "Content-Type: application/json" \
  -d '{"acciones":[{"tipo":"recoger","jugadorId":1,"objetoId":1},{"tipo":"curar","jugadorId":1}]}'
```

Con `"detenerEnError": true` las acciones posteriores al primer fallo quedan como `omitida`.

## Estructura

```text
src/
  app.js, server.js
  constants/        rutas y reglas numericas del juego
  domain/
    partida.js      reglas del juego
    geometria.js    distancias y zona
    errores/        clases, catalogo y crear()
  http/
    errores-http.js errores del borde y su catalogo
    problemas.js    traduccion error -> problem+json
  middlewares/      idPeticion, manejadorDeErrores, notFound, exigirJson, metodoNoPermitido
  validators/       validacion de entrada (400)
  services/         casos de uso entre repositorios y dominio
  repositories/     almacenamiento en memoria
  routes/           errores, jugadores, partidas
  data/             jugadores, partidas y botin iniciales
soporte/            ayudas de las pruebas
test/               118 pruebas
```

## Pruebas

```bash
npm test
npm run test:cobertura
```

Ademas de las reglas del juego y la API, hay pruebas de consistencia: todo codigo usado existe en el catalogo, ningun codigo del catalogo queda sin usar, cada categoria tiene estado HTTP y el dominio no importa nada de HTTP.
