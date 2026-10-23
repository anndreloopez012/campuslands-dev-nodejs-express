# Ejercicio 21 - rate limit conceptual (Juan Lema)

## Que hace

Tematica animacion 3D. Un render es costoso, asi que la API limita cuantas peticiones puede hacer cada cliente. El limitador esta escrito a mano en `src/middlewares/rate-limit.js` (sin librerias) para ver el concepto:

- **Ventana deslizante**: por cada cliente (`req.ip`) se guardan las marcas de tiempo de sus peticiones y se descartan las que salieron de la ventana. Si quedan `limit` o mas, se responde `429`. A diferencia de una ventana fija, no permite doble rafaga en el cambio de ventana.
- **Cuotas independientes por tipo de operacion**: `GET /renders` y `GET /renders/:id` comparten un limite de 10 por minuto; `POST /renders` (crear un render, lo caro) tiene uno propio de 3 por minuto. Agotar uno no afecta al otro.
- **Headers estandar** en cada respuesta limitada: `RateLimit-Limit`, `RateLimit-Remaining` y `RateLimit-Reset` (segundos). En un `429` se agrega `Retry-After`, que va bajando mientras pasa el tiempo.
- **Las peticiones rechazadas no se registran**: insistir durante el bloqueo no lo alarga; en cuanto vence la marca mas antigua se recupera cupo.
- Las peticiones con error de validacion (`400`) **si consumen cuota**, porque el limite se evalua antes del controlador.
- **Limpieza de memoria**: un temporizador (`unref`, no impide cerrar el proceso) borra a los clientes sin actividad reciente, para que el mapa no crezca sin fin.
- `GET /health` y las rutas inexistentes no estan limitadas (por ejemplo, para monitoreo).

Limitaciones conceptuales: el estado vive en la memoria de un solo proceso, asi que con varias instancias cada una cuenta por separado (en produccion se usa un almacen compartido como Redis). Detras de un proxy inverso todos los clientes compartirian la IP del proxy salvo que se configure `app.set("trust proxy", ...)`.

La ventana es de 60 segundos y se puede acortar para probar con `RATE_LIMIT_WINDOW_MS`.

## Como ejecutar

```bash
npm install
npm start
```

Con una ventana corta (3 segundos) para probar la recuperacion sin esperar un minuto:

```bash
RATE_LIMIT_WINDOW_MS=3000 npm start
```

## Como probar

```bash
curl -i http://localhost:4021/renders
curl -i http://localhost:4021/renders/1
curl -i -X POST http://localhost:4021/renders -H "Content-Type: application/json" -d "{\"scene\":\"Robot bailando\",\"frames\":120,\"resolution\":\"720p\"}"
```

Repite cualquiera de ellos y observa como baja `RateLimit-Remaining`.

## Como probar los casos de error

Agotar el limite de lecturas (a partir de la peticion 11 responde `429` con `Retry-After`):

```bash
for i in $(seq 1 12); do curl -s -o /dev/null -w "%{http_code} " http://localhost:4021/renders; done
```

Agotar el limite de creacion (la cuarta responde `429`):

```bash
for i in $(seq 1 4); do curl -s -o /dev/null -w "%{http_code} " -X POST http://localhost:4021/renders -H "Content-Type: application/json" -d "{\"scene\":\"Prueba\",\"frames\":10}"; done
```

Otros errores de la API:

```bash
curl http://localhost:4021/renders/99
curl http://localhost:4021/renders/abc
curl -X POST http://localhost:4021/renders -H "Content-Type: application/json" -d "{\"frames\":10}"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── routes/renders.routes.js
├── controllers/renders.controller.js
├── services/renders.service.js
└── middlewares/rate-limit.js
```
