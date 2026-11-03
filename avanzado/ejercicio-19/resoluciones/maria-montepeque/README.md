# Avanzado 19 - auditoria de acciones (tatuajes)

API de citas de un estudio de tatuajes donde **cada accion queda auditada**: quien la hizo, que hizo, cuando, desde que ip, con que requestId y que cambio (antes y despues).

## Como ejecutar

```bash
npm install
npm start      # http://localhost:4019
npm test
```

## Que tiene la auditoria

- **Solo se agrega**: no hay funciones para editar o borrar, las entradas se guardan congeladas (`Object.freeze`) y `DELETE/PUT/PATCH /api/auditoria` responde 405 (y el intento tambien se anota).
- **Cadena de hashes**: cada entrada guarda el sha256 de la anterior. Si alguien cambia una entrada vieja, `GET /api/auditoria/verificar` dice en que entrada se rompio. Si ademas recalcula el hash, se rompe la siguiente. Si borra una, tambien se nota.
- **Solo lo que cambio**: `cambios` tiene unicamente los campos distintos `{ campo: { antes, despues } }`.
- **Datos sensibles**: `alergias`, `documento`, etc. se guardan en la cita pero en la auditoria solo sale `[OCULTO]`.
- **Tambien los fallos**: permisos denegados y peticiones sin usuario quedan con `resultado: "denegado"`.
- **Quien mira la auditoria tambien queda auditado** (`auditoria.consultar`).
- Los errores de validacion (400) no se auditan porque no paso ninguna accion.

## Usuarios (simulados con el header `X-Usuario-Id`)

| id | nombre | rol | puede |
| -- | ------ | --- | ----- |
| 1 | Rosa | recepcion | crear, reprogramar, cancelar |
| 2 | Kevin | tatuador | reprogramar, registrar salud |
| 3 | Laura | auditor | consultar la auditoria |
| 4 | Mario | admin | todo |

## Endpoints

| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET | `/health` | estado |
| POST | `/api/citas` | crear cita |
| GET | `/api/citas/:id` | ver cita |
| PATCH | `/api/citas/:id/fecha` | reprogramar (pide `motivo`) |
| POST | `/api/citas/:id/cancelar` | cancelar |
| PUT | `/api/citas/:id/salud` | registrar alergias (dato sensible) |
| GET | `/api/auditoria` | filtros: `accion`, `recursoTipo`, `recursoId`, `actorId`, `resultado`, `desde`, `hasta` |
| GET | `/api/auditoria/verificar` | revisa la cadena de hashes |

## Ejemplos

```bash
curl -X POST localhost:4019/api/citas -H "X-Usuario-Id: 1" -H "Content-Type: application/json" \
  -d '{"cliente":"Valeria","diseno":"Quetzal en el brazo","fecha":"2026-12-01T15:00:00Z"}'

curl -X PATCH localhost:4019/api/citas/1/fecha -H "X-Usuario-Id: 2" -H "Content-Type: application/json" \
  -d '{"fecha":"2026-12-05T15:00:00Z","motivo":"el cliente se enfermo"}'

curl "localhost:4019/api/auditoria?recursoTipo=cita&recursoId=1" -H "X-Usuario-Id: 3"
curl localhost:4019/api/auditoria/verificar -H "X-Usuario-Id: 3"
```

Entrada de ejemplo:

```json
{
  "n": 2,
  "fecha": "2026-11-02T15:10:00.000Z",
  "actor": { "id": 2, "nombre": "Kevin (tatuador)", "rol": "tatuador" },
  "accion": "citas.reprogramar",
  "resultado": "exito",
  "recurso": { "tipo": "cita", "id": 1 },
  "cambios": { "fecha": { "antes": "2026-12-01T15:00:00Z", "despues": "2026-12-05T15:00:00Z" } },
  "motivo": "el cliente se enfermo",
  "hashAnterior": "9f2c...",
  "hash": "a71b..."
}
```

## Estructura

```text
src/
├── app.js                  rutas y middleware de usuario
├── server.js
├── auditoria/registro.js   anotar, verificar, buscar (cadena de hashes)
└── servicios/citas.js      reglas de las citas y permisos
test/
├── registro.test.js
└── api.test.js
```
