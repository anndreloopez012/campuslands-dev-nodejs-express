# Avanzado 06 - colas de tareas conceptuales

API de un taller de motos hecha con Node.js y Express. Pedir un
diagnostico es un trabajo lento (revisar la moto, armar el presupuesto,
avisarle al cliente), asi que la API **no lo hace dentro de la
peticion**: lo deja en una cola y responde enseguida.

## El problema

Si el diagnostico se hiciera en la peticion:

- El cliente se queda esperando con la conexion abierta.
- Si llegan 100 pedidos juntos, el servidor intenta hacer 100 a la vez.
- Si algo falla a la mitad (un escaner que no responde), se pierde el
  pedido y el cliente tiene que volver a mandarlo.

## Como funciona

```text
POST /api/diagnosticos  ->  202 Accepted + Location: /api/tareas/1
                              |
                              v
                     [ cola en memoria ]  --> worker 1 --> diagnostico
                                         --> worker 2 --> notificar-cliente
                              |
GET /api/tareas/1  <- el cliente pregunta como va (Retry-After: 1)
```

1. El pedido se valida y se encola. La respuesta es **202 Accepted**
   ("lo recibi, lo voy a hacer") con:
   - `Location`: donde consultar la tarea.
   - `Retry-After: 1`: cada cuantos segundos volver a preguntar.
2. Unos "workers" sacan tareas de la cola y las hacen, maximo
   `concurrencia` a la vez (por defecto 2).
3. El cliente consulta `GET /api/tareas/:id` hasta que el estado sea
   `completada` o `fallida`. Mientras no termina la respuesta trae
   `Retry-After`.
4. Cuando el diagnostico termina, **encola otra tarea**: avisarle al
   cliente por SMS (simulado), con prioridad baja.

### La cola (`src/cola/cola.js`)

Hecha a mano para entender como funcionan las de verdad (BullMQ,
RabbitMQ, SQS):

| Que                    | Como                                                          |
| ---------------------- | ------------------------------------------------------------- |
| Concurrencia           | Nunca hay mas de `concurrencia` tareas en proceso             |
| Prioridad              | `alta`, `normal`, `baja`; a igual prioridad, la que llego primero |
| Reintentos             | Si falla, se vuelve a intentar hasta `maxIntentos` (3)        |
| Backoff exponencial    | Entre intentos espera 1x, 2x, 4x... `backoffBaseMs`. Si el problema es pasajero le da tiempo de arreglarse |
| Cola de muertas (DLQ)  | Si falla todos los intentos queda `fallida` en una lista aparte para revisarla |
| Reintento manual       | `POST /api/tareas/:id/reintentar` vuelve a poner una muerta en la cola |
| Timeout                | Si un trabajo tarda mas de `timeoutMs` se da por fallido       |
| Tareas encadenadas     | Un trabajo puede encolar otro (queda `padreId`)               |
| Pausar / reanudar      | Pausada acepta tareas pero no las empieza                     |
| Cierre ordenado        | Con Ctrl+C deja de tomar tareas y espera las que estan en proceso |

Estados:

```text
pendiente -> en_proceso -> completada
                 |
                 +-> fallo -> esperando_reintento -> pendiente -> ...
                 +-> fallo sin intentos -> fallida (cola de muertas)
```

### Limitaciones (por eso es conceptual)

- La cola vive **en memoria**: si el servidor se reinicia, se pierden las
  tareas. Una cola real (Redis, RabbitMQ) las guarda aparte.
- Los workers corren en el mismo proceso que la API. En produccion
  suelen ser procesos aparte que se pueden escalar solos.
- El timeout marca la tarea como fallida pero JavaScript no puede
  cancelar la promesa: el trabajo original sigue corriendo de fondo.
- Si se reintenta, el trabajo puede correr mas de una vez. Por eso los
  trabajos de una cola deberian poder repetirse sin causar problemas
  (idempotencia, se ve en el avanzado 20).

## Simular fallas

Para ver los reintentos se puede mandar `simular` en el body (solo fuera
de `NODE_ENV=production`):

| `simular`        | Que pasa                                           |
| ---------------- | -------------------------------------------------- |
| `fallar-2-veces` | Falla 2 veces y al tercer intento sale bien        |
| `fallar-siempre` | Falla los 3 intentos y termina en la cola de muertas |
| `lento`          | Tarda mas que el timeout                           |

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                          |
| ------------- | ------------------------------------ |
| `npm start`   | Servidor en http://localhost:4006    |
| `npm run dev` | Servidor con recarga automatica      |
| `npm test`    | Tests de la cola y de la API         |

## Endpoints

| Metodo | Ruta                          | Descripcion                                |
| ------ | ----------------------------- | ------------------------------------------ |
| GET    | `/health`                     | El servidor vive                           |
| GET    | `/api/sintomas`               | Sintomas que se pueden pedir               |
| POST   | `/api/diagnosticos`           | `{ placa, sintomas, telefono, prioridad?, simular? }` -> 202 |
| GET    | `/api/tareas`                 | Todas las tareas, `?estado=`               |
| GET    | `/api/tareas/:id`             | Una tarea con su estado y resultado        |
| POST   | `/api/tareas/:id/reintentar`  | Reintenta una tarea fallida                |
| GET    | `/api/cola`                   | Estadisticas y la lista de muertas         |
| POST   | `/api/cola/pausar`            | Pausa la cola                              |
| POST   | `/api/cola/reanudar`          | La reanuda                                 |
| GET    | `/api/sms-enviados`           | SMS que mando la tarea de notificar        |

Sintomas: `ruido-cadena`, `frenos-esponjosos`, `no-arranca`,
`humo-azul`, `luz-aceite`, `vibracion`.

## Ejemplo (PowerShell)

```bash
curl.exe -i -X POST http://localhost:4006/api/diagnosticos -H "Content-Type: application/json" -d '{\"placa\":\"M123ABC\",\"sintomas\":[\"no-arranca\",\"frenos-esponjosos\"],\"telefono\":\"55551234\"}'
```

```text
HTTP/1.1 202 Accepted
Location: /api/tareas/1
Retry-After: 1
```

```json
{ "ok": true, "message": "Diagnostico en cola", "data": { "tareaId": 1, "estado": "pendiente", "consultar": "/api/tareas/1" } }
```

Un momento despues:

```bash
curl.exe http://localhost:4006/api/tareas/1
```

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "tipo": "diagnostico",
    "estado": "completada",
    "intentos": 1,
    "errores": [],
    "resultado": {
      "placa": "M123ABC",
      "trabajos": [
        { "sintoma": "no-arranca", "trabajo": "Revisar bateria y bujia", "precio": 120 },
        { "sintoma": "frenos-esponjosos", "trabajo": "Purgar sistema de frenos", "precio": 150 }
      ],
      "total": 270,
      "notificacionId": 2
    }
  }
}
```

```bash
curl.exe http://localhost:4006/api/sms-enviados
```

```json
{ "ok": true, "data": [{ "telefono": "55551234", "mensaje": "Su moto M123ABC ya fue revisada. Presupuesto: Q270" }] }
```

## Tests

```text
test/
├── cola.test.js  la cola sola: concurrencia, prioridad, backoff, muertas, reintento manual, timeout, pausar, encadenadas, cerrar
└── api.test.js   202 + Location, polling, notificacion encadenada, fallos simulados, pausar, validaciones
```

Los tests usan tiempos de milisegundos (`backoffBaseMs: 5`, diagnosticos
de 20ms) y `cola.cuandoTermine(id)` para esperar una tarea sin poner
`sleep` fijos.

```text
ℹ tests 23
ℹ pass 23
ℹ fail 0
```

Como hay tiempos de por medio, los corri 5 veces seguidas y pasaron
siempre. Para comprobar que sirven meti dos errores a proposito:

- Quitar el limite de concurrencia: fallo
  `no trabaja mas tareas a la vez que la concurrencia`.
- Esperar siempre lo mismo entre reintentos (sin exponencial): fallo
  `reintenta con backoff exponencial hasta que sale`.

## Casos de error

| Caso                                 | Status | Mensaje                                         |
| ------------------------------------ | ------ | ----------------------------------------------- |
| Body invalido                        | 400    | `Datos invalidos` + lista `errors`              |
| `simular` en produccion              | 400    | `simular no esta permitido`                     |
| Tarea que no existe                  | 404    | `No existe la tarea 99`                         |
| Reintentar una tarea que no fallo    | 409    | `Solo se reintentan tareas fallidas, esta esta "completada"` |
| El trabajo falla                     | (la tarea) | queda en `errores` con el numero de intento |
