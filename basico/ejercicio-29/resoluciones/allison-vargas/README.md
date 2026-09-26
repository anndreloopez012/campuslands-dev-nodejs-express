# API de Partidos - Futbol y Futbol Sala

API REST simple para registrar y consultar partidos de futbol y futbol
sala.

## Tabla de contenidos

- Descripcion
- Requisitos previos
- Instalacion
- Como ejecutar
- Estructura del proyecto
- Referencia de la API
- Codigos de estado usados
- Como probar
- Limitaciones conocidas

## Descripcion

Cada partido tiene un equipo local, un equipo visitante, una modalidad
(futbol o futbol_sala), un estado (programado, en_curso o
finalizado) y un marcador (nulo mientras no haya arrancado). Los
datos se guardan en src/data/partidos.json y persisten entre
reinicios del servidor (se lee y se escribe con fs/promises).

## Requisitos previos

- Node.js 20 o superior.
- npm (viene incluido con Node.js).

## Instalacion

```bash
cd basico/ejercicio-29/resoluciones/allison-vargas
npm install
```

Esto instala la unica dependencia del proyecto: express.

## Como ejecutar

```bash
npm run dev
```

Levanta el servidor con node --watch, reiniciandolo solo cada vez que
guardas un cambio. Si prefieres correrlo sin watch:

```bash
npm start
```

Por defecto escucha en http://localhost:3000. Si el puerto 3000 esta
ocupado, define uno distinto con la variable de entorno PORT:

```bash
PORT=4000 npm run dev
```

En PowerShell:

```powershell
$env:PORT=4000; npm run dev
```

## Estructura del proyecto

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js              # configuracion de Express y middlewares
    |-- server.js            # arranca el servidor HTTP
    |-- routes/
    |   `-- ejercicio.routes.js
    |-- controllers/
    |   `-- ejercicio.controller.js
    |-- services/
    |   `-- partidos.service.js   # lectura/escritura de partidos.json
    |-- validators/
    |   `-- partido.validator.js  # reglas de validacion del body
    `-- data/
        `-- partidos.json    # los partidos, persistidos en disco
```

## Referencia de la API

Todas las respuestas son JSON y tienen la forma
{ "ok": true, ... } en exito, o { "ok": false, "message" | "errores": ... }
en error.

### GET /basico/ejercicio-29

Endpoint de verificacion del ejercicio.

Respuesta 200:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "README tecnico"
}
```

### GET /basico/ejercicio-29/partidos

Lista todos los partidos registrados.

```bash
curl http://localhost:3000/basico/ejercicio-29/partidos
```

Respuesta 200:

```json
{
  "ok": true,
  "partidos": [
    {
      "id": 1,
      "equipo_local": "Halcones FC",
      "equipo_visitante": "Rayo Sala",
      "modalidad": "futbol",
      "estado": "finalizado",
      "marcador_local": 2,
      "marcador_visitante": 1
    }
  ]
}
```

### GET /basico/ejercicio-29/partidos/:id

Devuelve un partido especifico por su id.

| Parametro | Tipo | Ubicacion | Descripcion |
|---|---|---|---|
| id | numero | ruta (req.params) | id numerico del partido |

```bash
curl http://localhost:3000/basico/ejercicio-29/partidos/1
```

Respuesta 200 (partido encontrado): igual a un elemento del
arreglo de arriba, bajo la clave partido.

Respuesta 404 (no existe ese id):

```json
{ "ok": false, "message": "No existe un partido con id 99" }
```

### POST /basico/ejercicio-29/partidos

Crea un partido nuevo. El marcador siempre inicia en null; se
actualizaria en un endpoint aparte (fuera del alcance de este
ejercicio).

Body esperado (JSON):

| Campo | Tipo | Obligatorio | Valores permitidos |
|---|---|---|---|
| equipo_local | string | si | cualquier texto no vacio |
| equipo_visitante | string | si | cualquier texto no vacio, distinto de equipo_local |
| modalidad | string | si | futbol, futbol_sala |
| estado | string | si | programado, en_curso, finalizado |

```bash
curl -X POST http://localhost:3000/basico/ejercicio-29/partidos -H "Content-Type: application/json" -d "{\"equipo_local\":\"Lobos FC\",\"equipo_visitante\":\"Cobras Sala\",\"modalidad\":\"futbol_sala\",\"estado\":\"programado\"}"
```

Respuesta 201:

```json
{
  "ok": true,
  "partido": {
    "id": 3,
    "equipo_local": "Lobos FC",
    "equipo_visitante": "Cobras Sala",
    "modalidad": "futbol_sala",
    "estado": "programado",
    "marcador_local": null,
    "marcador_visitante": null
  }
}
```

Respuesta 400 (body invalido; devuelve TODOS los errores encontrados):

```bash
curl -X POST http://localhost:3000/basico/ejercicio-29/partidos -H "Content-Type: application/json" -d "{\"equipo_local\":\"Solo Uno\"}"
```

```json
{
  "ok": false,
  "errores": [
    "equipo_visitante es obligatorio y debe ser un texto no vacio",
    "modalidad es obligatoria y debe ser una de: futbol, futbol_sala",
    "estado es obligatorio y debe ser uno de: programado, en_curso, finalizado"
  ]
}
```

## Codigos de estado usados

| Status | Cuando aparece |
|---|---|
| 200 OK | Consulta exitosa (listar o ver un partido) |
| 201 Created | Partido creado con exito |
| 400 Bad Request | El body de creacion no paso la validacion |
| 404 Not Found | El id pedido no existe |
| 500 Internal Server Error | Error inesperado (por ejemplo, si partidos.json no se puede leer) |

## Limitaciones conocidas

- No hay autenticacion ni autorizacion: cualquiera que acceda al
  servidor puede crear partidos.
- No existe un endpoint para actualizar el marcador ni el estado de un
  partido ya creado (solo lectura y creacion).
- Los datos se guardan en un archivo JSON plano, no en una base de
  datos real; no esta pensado para uso concurrente con muchos
  escritores al mismo tiempo.
