# Ejercicio 21 - rate limit conceptual

API de un estudio de animacion 3D hecha con Node.js y Express. Limita
cuantas peticiones puede hacer cada cliente en un tiempo. El limitador
esta hecho a mano (sin `express-rate-limit`) para ver como funciona por
dentro.

## La idea

Sin limite, un cliente (o un script) puede mandar miles de peticiones y
tumbar el servidor, o pedir renders sin parar que gastan mucha
maquina. Un rate limit dice: "maximo N peticiones cada X segundos". Si
se pasa, responde **429 Too Many Requests** y le dice cuando volver.

## Como funciona (ventana fija)

Esta en `src/middlewares/rate-limit.middleware.js`:

1. Cada cliente se identifica por su IP (`req.ip`).
2. Por cada cliente se guarda `{ inicio, cantidad }` en un `Map`.
3. En cada peticion:
   - Si es la primera o ya paso la ventana, el contador vuelve a 0.
   - Suma 1. Si pasa de `max`, responde 429 con `Retry-After`.
4. Un `setInterval` borra los contadores vencidos para que el `Map` no
   crezca para siempre.

`crearRateLimit({ nombre, ventanaMs, max, mensaje })` devuelve un
middleware, asi se pueden tener varios limites distintos:

| Limite    | Donde                     | Por defecto     |
| --------- | ------------------------- | --------------- |
| `general` | Todas las rutas de `/api` | 30 cada 60 s    |
| `renders` | Solo `POST /api/renders`  | 3 cada 60 s     |

Crear un render pasa por los dos: cuenta para el general y para el de
renders.

Headers que se mandan en cada respuesta:

| Header                | Significado                                  |
| --------------------- | -------------------------------------------- |
| `RateLimit-Policy`    | `max;w=segundos` del limite                  |
| `RateLimit-Limit`     | Cuantas peticiones se permiten en la ventana |
| `RateLimit-Remaining` | Cuantas le quedan                            |
| `RateLimit-Reset`     | En cuantos segundos se reinicia el contador  |
| `Retry-After`         | Solo con 429, cuantos segundos esperar       |

En `POST /api/renders` los headers son los del limite de renders, porque
es el ultimo que pasa.

### Limitaciones (por eso es conceptual)

- **Ventana fija**: si alguien manda 30 al final de un minuto y 30 al
  inicio del siguiente, pasan 60 en pocos segundos. Las librerias usan
  ventana deslizante o "token bucket" para evitarlo.
- **En memoria**: con varios servidores cada uno tiene su contador, y al
  reiniciar se pierde. En produccion se guarda en algo compartido como
  Redis.
- **Por IP**: varias personas detras del mismo router comparten limite.
  Si la API estuviera detras de un proxy habria que configurar
  `app.set("trust proxy", ...)` para que `req.ip` sea la IP real.
- No uso un header como `x-api-key` para identificar al cliente sin
  verificarlo, porque mandando uno inventado cada vez se saltaria el
  limite.

| Carpeta / archivo | Que hay dentro                                     |
| ----------------- | -------------------------------------------------- |
| `config.js`       | Lee los limites del `.env`                         |
| `middlewares/`    | `rate-limit.middleware.js` (limitador y estado)    |
| `routes/`         | `index.js`, donde se aplican los limites           |
| `controllers/`    | `renders.controller.js`                            |
| `services/`       | `renders.service.js` (simula el tiempo de render)  |
| `utils/`          | `app-error.js`                                     |
| `data/`           | `db.js` con modelos y renders en memoria           |

## Variables de entorno

```bash
copy .env.example .env
```

| Variable                        | Por defecto |
| ------------------------------- | ----------- |
| `PORT`                          | `3021`      |
| `RATE_LIMIT_VENTANA_SEGUNDOS`   | `60`        |
| `RATE_LIMIT_MAX`                | `30`        |
| `RENDER_LIMIT_VENTANA_SEGUNDOS` | `60`        |
| `RENDER_LIMIT_MAX`              | `3`         |

Para probar rapido conviene bajar los valores, por ejemplo
`RATE_LIMIT_MAX=5` y `RATE_LIMIT_VENTANA_SEGUNDOS=10`.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3021       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

## Endpoints

| Metodo | Ruta            | Limites            | Descripcion                          |
| ------ | --------------- | ------------------ | ------------------------------------ |
| GET    | `/health`       | Ninguno            | Comprueba que el servidor vive       |
| GET    | `/api/limites`  | Ninguno            | Cuanto llevo usado de cada limite    |
| GET    | `/api/modelos`  | general            | Modelos 3D                           |
| GET    | `/api/renders`  | general            | Renders pedidos                      |
| POST   | `/api/renders`  | general + renders  | Pide un render (responde 202, queda en cola) |

`/api/limites` no cuenta para el limite, asi se puede consultar aunque ya
este bloqueado.

Body para pedir un render: `modeloId` y `calidad` (`baja`, `media` o
`alta`).

## Ejemplos (PowerShell)

Pedir un render y ver los headers:

```bash
curl.exe -i -X POST http://localhost:3021/api/renders -H "Content-Type: application/json" -d '{\"modeloId\":2,\"calidad\":\"alta\"}'
```

```text
HTTP/1.1 202 Accepted
RateLimit-Limit: 3
RateLimit-Remaining: 2
RateLimit-Reset: 60
```

```json
{ "ok": true, "data": { "id": 1, "modeloId": 2, "modelo": "Dragon de cristal", "calidad": "alta", "estado": "en cola", "minutosEstimados": 96, "creado": "2026-11-02T23:47:32.240Z" } }
```

Mandar varias peticiones seguidas para llegar al limite:

```powershell
1..4 | ForEach-Object { curl.exe -s -o NUL -w "%{http_code}`n" -X POST http://localhost:3021/api/renders -H "Content-Type: application/json" -d '{\"modeloId\":1,\"calidad\":\"baja\"}' }
```

```text
202
202
202
429
```

La respuesta 429:

```text
HTTP/1.1 429 Too Many Requests
RateLimit-Remaining: 0
Retry-After: 57
```

```json
{ "ok": false, "message": "Pediste muchos renders seguidos, espera antes de pedir otro", "limite": "renders", "reintentarEnSegundos": 57 }
```

Ver cuanto llevo:

```bash
curl.exe http://localhost:3021/api/limites
```

```json
{
  "ok": true,
  "data": {
    "cliente": "ip:::1",
    "limites": {
      "general": { "max": 30, "ventanaSegundos": 60, "usadas": 4, "restantes": 26, "resetEnSegundos": 57 },
      "renders": { "max": 3, "ventanaSegundos": 60, "usadas": 4, "restantes": 0, "resetEnSegundos": 57 }
    }
  }
}
```

## Casos de error

| Caso                                  | Status | Mensaje                                                       |
| ------------------------------------- | ------ | ------------------------------------------------------------- |
| Pasar el limite general               | 429    | `Demasiadas peticiones, espera un momento`                    |
| Pasar el limite de renders            | 429    | `Pediste muchos renders seguidos, espera antes de pedir otro` |
| Render con calidad que no existe      | 400    | `Datos invalidos` + lista `errors`                            |
| Render de un modelo que no existe     | 404    | `No existe el modelo con id 9`                                |

Las peticiones con error (400 o 404) tambien cuentan para el limite.

## Notas

Los contadores y los renders viven en memoria, al reiniciar el servidor
se reinician.
