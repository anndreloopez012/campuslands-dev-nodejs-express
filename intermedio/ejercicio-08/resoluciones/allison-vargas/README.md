# Intermedio 08 - middleware de request id (Allison Vargas)

## Que hace este ejercicio

API de hiperdeportivos donde cada peticion recibe un identificador unico que la acompana de punta a punta:

- `middlewares/requestId.js`: usa el header `x-request-id` si llega y tiene un formato valido (8 a 64 caracteres: letras, numeros, `.`, `_`, `-`). Si no llega o no es valido, genera un UUID. Lo guarda en `req.id` y lo devuelve en el header `x-request-id` de la respuesta.
- `middlewares/requestLogger.js`: registra cada peticion al terminar (metodo, ruta, status y duracion) con su id.
- `middlewares/contextoRequest.js` + `utils/context.js`: guardan el id en un `AsyncLocalStorage` para que cualquier capa lo lea sin recibir `req`. Va despues de `express.json()` porque el parseo del body rompe el contexto asincrono.
- `utils/logger.js`: agrega el id a cada linea de log automaticamente, incluso desde los services.
- `services/telemetria.service.js`: ejemplo de propagacion, arma los headers con el mismo id para llamar a un servicio externo.
- `middlewares/errorHandler.js`: incluye `solicitudId` en cada error para rastrearlo en los logs.

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- routes/
    |-- controllers/
    |-- services/
    |-- validators/
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: hiperdeportivos (con sus vueltas) y contexto.
- controllers: validan, llaman al service y responden.
- services: reglas de negocio y telemetria.
- validators: validan la entrada y lanzan `ValidationError`.
- middlewares: requestId, requestLogger, contextoRequest, notFound y errorHandler.
- utils: contexto asincrono, logger, errores tipados, catchAsync y lector de JSON.
- data: hiperdeportivos iniciales en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-08/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-08
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "middleware de request id"
}
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /hiperdeportivos | Lista, filtros `?marca=&minPotencia=` |
| GET | /hiperdeportivos/:id | Detalle |
| POST | /hiperdeportivos | Crea un hiperdeportivo |
| GET | /hiperdeportivos/:id/vueltas | Vueltas registradas del auto |
| POST | /hiperdeportivos/:id/vueltas | Registra una vuelta (`circuito`, `tiempoSegundos`) |
| GET | /contexto | Muestra el request id en el request, en el service y en el header |

```bash
curl -i http://localhost:3000/intermedio/ejercicio-08/contexto
curl -i -H "x-request-id: carrera-monza-001" http://localhost:3000/intermedio/ejercicio-08/contexto
curl -X POST http://localhost:3000/intermedio/ejercicio-08/hiperdeportivos/1/vueltas -H "Content-Type: application/json" -d "{\"circuito\":\"Monza\",\"tiempoSegundos\":84.2}"
```

En la terminal del servidor cada linea de log muestra el id entre corchetes, por ejemplo `[carrera-monza-001]`, y se puede seguir una peticion completa filtrando por ese valor.

## Formato de error

```json
{
  "ok": false,
  "message": "El hiperdeportivo no existe",
  "codigo": "HIPERDEPORTIVO_NO_ENCONTRADO",
  "solicitudId": "carrera-monza-001"
}
```

Errores: 400 datos invalidos, 404 recurso o ruta inexistente, 409 hiperdeportivo duplicado.
