# Avanzado 19 - Auditoria de acciones (tatuajes)

API en Node.js y Express para un estudio de tatuajes: citas, consentimientos y fichas de clientes. Cada accion relevante deja una entrada de auditoria que responde **quien, que, cuando, desde donde, sobre que y que cambio**. El registro es solo de agregado, esta encadenado con SHA-256 para detectar manipulaciones y se escribe **antes** de aplicar el cambio: si la auditoria falla, la accion no ocurre.

## Como ejecutarlo

```bash
npm install
npm start          # puerto 3000, cambia con PORT=3100
npm test
```

Ruta base: `/avanzado/ejercicio-19`. La identidad se simplifica con la cabecera `X-Usuario-Id` (1 Mara admin, 2 Iker recepcion, 3 Luna tatuadora, 4 Teo tatuador). Opcionalmente `X-Request-Id` para correlacionar.

## Probar rapido

```bash
BASE=http://localhost:3000/avanzado/ejercicio-19
curl -H "X-Usuario-Id: 2" -H "Content-Type: application/json" \
  -d '{"clienteId":2,"tatuadorId":3,"fecha":"2030-01-10T15:00:00Z","zona":"antebrazo","precio":180000}' $BASE/citas
curl -H "X-Usuario-Id: 4" -X POST $BASE/citas/1/realizacion
curl -H "X-Usuario-Id: 1" "$BASE/auditoria?resultado=denegado"
curl -H "X-Usuario-Id: 1" $BASE/auditoria/verificacion
```

## Una entrada de auditoria

```json
{
  "secuencia": 2,
  "momento": "2026-11-05T12:00:00.000Z",
  "actor": { "id": 2, "rol": "recepcion" },
  "accion": "cita.editar",
  "recurso": { "tipo": "cita", "id": 1 },
  "resultado": "exito",
  "cambios": [{ "campo": "precio", "antes": 180000, "despues": 200000 }],
  "motivo": null,
  "requestId": "req-tatuaje-001",
  "ip": "::1",
  "hashAnterior": "9f2c...",
  "hash": "41ab..."
}
```

## Decisiones

- **Que se audita**: altas, cambios, cancelaciones (con motivo), consentimientos, realizacion, **intentos denegados** (`resultado: "denegado"`) y **lecturas de datos sensibles** (`cliente.ver_sensible` cuando alguien ve alergias).
- **Diff**: solo los campos que cambiaron, incluso anidados (`cita.estado`, `cliente.alergias`).
- **Datos sensibles**: `alergias`, `telefono`, `email` y `documento` nunca se copian al registro. Queda `{ "antes": "[PROTEGIDO]", "despues": "[PROTEGIDO]", "protegido": true }`: se sabe que cambiaron, no a que.
- **Solo agregar**: no hay rutas para editar ni borrar entradas, y cada entrada se congela con `Object.freeze`.
- **Cadena de hashes**: el hash de cada entrada se calcula sobre su contenido en JSON canonico (claves ordenadas) e incluye el hash de la anterior. Cambiar, borrar o reordenar una entrada rompe la cadena desde ese punto. `GET /auditoria/verificacion` recorre todo y dice donde se rompio.
- **Auditar y despues aplicar**: el servicio arma el estado nuevo, registra la auditoria y solo si eso funciona guarda el cambio. Si el almacenamiento de auditoria falla responde `503 AUDITORIA_NO_DISPONIBLE` y nada cambia. El consentimiento modifica cita y cliente, por eso usa **una sola entrada** que cubre ambos (todo o nada).

## Permisos

| Accion | Quien |
| --- | --- |
| Crear, editar, cancelar citas | recepcion, admin |
| Firmar consentimiento | recepcion o el tatuador de la cita |
| Realizar la cita | solo el tatuador asignado, con consentimiento firmado |
| Ver cliente | recepcion y admin; el tatuador solo si es su cliente. Las alergias solo las ven el admin y su tatuador |
| Auditoria | admin |

## Rutas

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio |
| `GET /clientes/:id` | Ficha del cliente segun permisos |
| `GET /citas` | Citas (el tatuador ve solo las suyas) |
| `POST /citas` | `{ clienteId, tatuadorId, fecha, zona, precio, deposito? }` |
| `PATCH /citas/:id` | `{ fecha?, zona?, precio? }` |
| `POST /citas/:id/cancelacion` | `{ motivo }` |
| `POST /citas/:id/consentimiento` | `{ firmado: true, alergiasDeclaradas: [] }` |
| `POST /citas/:id/realizacion` | Marca la cita como realizada |
| `GET /citas/:id/historial` | Entradas de auditoria de esa cita |
| `GET /auditoria` | Filtros: `actorId`, `accion` (prefijo), `recursoTipo`, `recursoId`, `resultado`, `desde`, `hasta`, `limite`, `despuesDe` (cursor) |
| `GET /auditoria/verificacion` | Verifica la cadena completa |
| `GET /auditoria/exportacion` | Todo el registro en NDJSON (una entrada por linea) |

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos o filtros invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `NO_AUTENTICADO` | 401 | Falta `X-Usuario-Id` o no existe |
| `PROHIBIDO` | 403 | El rol no permite la accion (queda auditado) |
| `CLIENTE_NO_ENCONTRADO`, `CITA_NO_ENCONTRADA` | 404 | No existe |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido |
| `ESTADO_INVALIDO` | 409 | La cita no esta en un estado que permita la accion |
| `SIN_CONSENTIMIENTO` | 409 | Se intenta tatuar sin consentimiento |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `ERROR_INTERNO` | 500 | Error inesperado |
| `AUDITORIA_NO_DISPONIBLE` | 503 | No se pudo auditar; la accion no se aplico |

## Estructura

```
src/
  app.js, server.js
  auditoria/    cadena (json canonico, hash, verificacion, diff), registro (agregar, proteger, consultar)
  services/     estudio (permisos, citas, clientes)
  routes/       estudio y auditoria
  validators/   validaciones escritas a mano
  middlewares/  errores, notFound, metodoNoPermitido, exigirTipo
  errores/      catalogo de errores
test/           cadena y registro, y pruebas de API (incluida la atomicidad)
```
