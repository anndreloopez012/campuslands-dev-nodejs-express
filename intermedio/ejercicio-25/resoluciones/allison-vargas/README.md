# Intermedio 25 - testing de rutas

## Que hace

API de un videojuego RPG: personajes, inventario y misiones. El foco del ejercicio es como probar las rutas: que cada metodo y URL exista, que lo que no existe responda 404 o 405 en JSON, que los ids y los parametros se validen antes de llegar al servicio y que cada ruta llame al servicio correcto con los argumentos correctos.

Para poder probar las rutas sin depender de la logica, la app se arma con una fabrica que recibe los servicios:

```js
crearApp({ personajes, inventario, misiones })
```

Con servicios reales se hacen pruebas de integracion. Con servicios simulados (`mock.fn`) se comprueba solo el cableado ruta -> controlador -> servicio.

Reglas del juego:
- Clases: guerrero, mago, arquero, clerigo, picaro. Cada una tiene vida y mana base y crece por nivel.
- Un personaje nuevo empieza en nivel 1 con 100 de oro.
- Para subir del nivel N al siguiente hacen falta N * 100 de experiencia. Nivel maximo: 50.
- El inventario tiene 20 espacios.
- Una mision solo se completa una vez por personaje y exige un nivel minimo.

## Estructura

```
src/
  app.js
  server.js
  constants/
    rpg.js
    rutas.js
  controllers/
  data/
  middlewares/
  repositories/
  routes/
  services/
  utils/
  validators/
soporte/
  cliente.js
test/
  contrato.test.js
  cableado.test.js
  personajes.test.js
  inventario-misiones.test.js
  progreso.test.js
```

`soporte/cliente.js` levanta la app en un puerto libre y ofrece funciones para hacer peticiones en las pruebas.

## Como ejecutar

```
npm install
npm run dev
```

Puerto 3000 por defecto (`PORT`).

## Como correr las pruebas

```
npm test
```

Otros scripts: `npm run test:watch` y `npm run test:cobertura`. Para un solo archivo: `node --test test/contrato.test.js`.

Que cubre cada archivo:
- `contrato.test.js`: recorre el catalogo de `src/constants/rutas.js`. Comprueba que cada ruta existe, que los metodos que no estan en el catalogo responden 405 con el header `Allow` correcto, el 404 en JSON, el orden de las rutas, los ids invalidos, los parametros de consulta y los errores de body (JSON mal formado, 415, 413).
- `cableado.test.js`: servicios simulados. Verifica con que argumentos se llama a cada servicio y que una peticion invalida no llega a llamarlo.
- `personajes.test.js` e `inventario-misiones.test.js`: pruebas de integracion con servicios reales.
- `progreso.test.js`: calculo de niveles y estadisticas.

## Respuesta esperada

`GET /intermedio/ejercicio-25`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "testing de rutas"
}
```

## Endpoints

Base: `/intermedio/ejercicio-25`

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | / | Ruta principal |
| GET | /rutas | Catalogo de rutas |
| GET | /personajes | Lista personajes |
| POST | /personajes | Crea un personaje |
| GET | /personajes/ranking | Ranking por nivel |
| GET | /personajes/:id | Detalle |
| PATCH | /personajes/:id | Renombra |
| DELETE | /personajes/:id | Elimina el personaje y su inventario |
| GET | /personajes/:id/inventario | Inventario |
| POST | /personajes/:id/inventario | Agrega un item |
| DELETE | /personajes/:id/inventario/:itemId | Quita un item |
| POST | /personajes/:id/misiones/:misionId/completar | Completa una mision |
| GET | /misiones | Lista misiones |
| GET | /misiones/:id | Detalle de mision |

Un metodo que no esta en la tabla responde 405 con el header `Allow`. `OPTIONS` responde 204 con `Allow`.

## Campos del body

`POST /personajes`:
- `nombre`: texto de 3 a 20 caracteres, unico sin distinguir mayusculas. Obligatorio.
- `clase`: guerrero, mago, arquero, clerigo o picaro. Obligatorio.

`PATCH /personajes/:id`:
- `nombre`: igual que arriba. Es el unico campo que se puede cambiar.

`POST /personajes/:id/inventario`:
- `nombre`: texto de 2 a 40 caracteres. Obligatorio.
- `tipo`: arma, armadura, pocion o material. Obligatorio.
- `rareza`: comun, raro, epico o legendario. Por defecto comun.
- `valor`: entero de 0 a 100000. Por defecto 0.
- `cantidad`: entero de 1 a 99. Por defecto 1.

Los requests con body deben enviar `Content-Type: application/json` (si no, 415) y no pueden superar 10 KB (si no, 413). Los campos desconocidos se rechazan.

## Parametros de consulta

`GET /personajes`:
- `clase`, `nivelMin` (1 a 50), `buscar` (texto del nombre)
- `orden`: id, nombre o nivel
- `pagina`, `limite` (1 a 50, por defecto 10)

`GET /personajes/ranking`: `pagina` y `limite` (1 a 10, por defecto 5).

`GET /misiones`:
- `dificultad`: facil, media, dificil o epica
- `nivel`: solo misiones con nivel minimo menor o igual a este
- `orden`: id, nivel u oro
- `pagina`, `limite`

Los parametros desconocidos o repetidos se rechazan con 400.

## Ejemplos

curl:

```
curl http://localhost:3000/intermedio/ejercicio-25
curl "http://localhost:3000/intermedio/ejercicio-25/personajes?clase=mago&orden=nivel"
curl http://localhost:3000/intermedio/ejercicio-25/personajes/ranking?limite=3
curl -X POST http://localhost:3000/intermedio/ejercicio-25/personajes -H "Content-Type: application/json" -d "{\"nombre\":\"Nova\",\"clase\":\"mago\"}"
curl -X POST http://localhost:3000/intermedio/ejercicio-25/personajes/4/misiones/3/completar
curl -X DELETE http://localhost:3000/intermedio/ejercicio-25/personajes/4/inventario/1
```

PowerShell:

```
Invoke-RestMethod http://localhost:3000/intermedio/ejercicio-25
Invoke-RestMethod "http://localhost:3000/intermedio/ejercicio-25/personajes?clase=mago&orden=nivel"
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-25/personajes -ContentType "application/json" -Body '{"nombre":"Nova","clase":"mago"}'
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-25/personajes/4/misiones/3/completar
Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-25/personajes/4/inventario -ContentType "application/json" -Body '{"nombre":"Espada corta","tipo":"arma"}'
```

## Formato de respuesta

Un recurso:

```json
{ "ok": true, "data": { "id": 6, "nombre": "Nova", "clase": "mago", "nivel": 1 } }
```

Un listado incluye `paginacion` y el header `X-Total-Count`:

```json
{
  "ok": true,
  "data": [],
  "paginacion": { "pagina": 1, "limite": 10, "total": 5, "totalPaginas": 1 }
}
```

Completar una mision:

```json
{
  "ok": true,
  "data": {
    "personaje": { "id": 4, "nivel": 5, "experiencia": 340, "oro": 360 },
    "recompensa": { "xp": 250, "oro": 150 },
    "nivelesGanados": 0
  }
}
```

## Errores

```json
{ "ok": false, "message": "Datos invalidos", "codigo": "VALIDACION", "errores": [{ "campo": "clase", "mensaje": "es obligatorio" }] }
```

| Status | Cuando | Codigo |
| --- | --- | --- |
| 400 | Datos, id o parametros invalidos, JSON mal formado | VALIDACION, ID_INVALIDO, CONSULTA_INVALIDA, JSON_INVALIDO, BODY_INVALIDO |
| 404 | Ruta o recurso inexistente | RUTA_NO_ENCONTRADA, PERSONAJE_NO_ENCONTRADO, MISION_NO_ENCONTRADA, ITEM_NO_ENCONTRADO |
| 405 | Metodo no permitido en la ruta | METODO_NO_PERMITIDO |
| 409 | Nombre repetido, inventario lleno, mision ya completada | NOMBRE_DUPLICADO, INVENTARIO_LLENO, MISION_YA_COMPLETADA |
| 413 | Body mayor a 10 KB | PAYLOAD_GRANDE |
| 415 | Content-Type distinto de application/json | TIPO_NO_SOPORTADO |
| 422 | Nivel insuficiente para la mision | NIVEL_INSUFICIENTE |
| 500 | Error inesperado | ERROR_INTERNO |
