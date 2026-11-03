# Avanzado 22 - webhooks simulados (arquitectura 3D)

Un estudio de arquitectura manda sus maquetas 3D a una **granja de render externa**. La granja nos avisa por webhook cuando empieza, termina o falla un render. Nosotros, a la vez, **mandamos webhooks** a los clientes que se suscriban (por ejemplo, la app del cliente que quiere saber cuando esta lista la imagen).

Las dos direcciones:

```text
granja de render --(webhook firmado)--> POST /webhooks/granja --> cambia el proyecto
                                                                    |
                                     emisor --(webhook firmado, con reintentos)--> suscriptores
```

## Como ejecutar

```bash
cp .env.example .env    # cambia SECRETO_GRANJA
npm install
npm start      # http://localhost:4022
npm test
```

## Recibir webhooks (`/webhooks/granja`)

- **Firma HMAC-SHA256** en `X-Firma: t=<segundos>,v1=<hex>` sobre `"t.cuerpo"`. Por eso esa ruta lee el body **crudo** (`express.text`), si se parsea y se vuelve a stringify los bytes pueden cambiar.
- Comparacion con `timingSafeEqual`.
- **Anti replay**: si `t` tiene mas de 5 minutos, 401.
- **Dedupe por id de evento**: si llega 2 veces, responde 200 con `duplicado: true` pero no lo aplica de nuevo.
- **Eventos desordenados**: si no cuadran con el estado actual (completado antes de iniciado) se ignoran.
- Responde rapido: los avisos a suscriptores salen despues, sin esperar.

## Enviar webhooks (`src/webhooks/emisor.js`)

- Cada suscriptor tiene su secreto; cada entrega va firmada igual que arriba, con `X-Evento-Id`, `X-Evento-Tipo` y `X-Intento`.
- Reintentos con **espera exponencial** (200, 400, 800 ms) ante error de red, 5xx, 408 o 429.
- Un 4xx normal no se reintenta.
- Si se acaban los intentos la entrega queda en **muertos** (dead letter) y se puede reintentar a mano.
- Filtros de eventos: `"proyecto.listo"`, `"proyecto.*"` o `"*"`.
- El secreto nunca sale en `GET /api/suscripciones`.

## Simulador

Para probar sin otro servidor hay un cliente falso dentro de la misma app:

- `POST /simulador/recibir`: recibe webhooks (`?configurarFallos=2` hace que responda 500 las proximas 2 veces).
- `GET /simulador/recibidos`: lo que le llego.

## Endpoints

| Metodo | Ruta | Descripcion |
| ------ | ---- | ----------- |
| GET | `/health` | estado |
| POST | `/webhooks/granja` | recibe eventos `render.iniciado`, `render.completado`, `render.fallido` |
| GET | `/api/proyectos` y `/api/proyectos/:id` | proyectos (`casa-lago`, `torre-norte`) |
| POST | `/api/suscripciones` | `{ url, eventos, secreto }` |
| GET | `/api/suscripciones` | sin secretos |
| GET | `/api/entregas` | historial de entregas e intentos |

## Probar a mano

```bash
# 1. suscribir al simulador
curl -X POST localhost:4022/api/suscripciones -H "Content-Type: application/json" \
  -d '{"url":"http://localhost:4022/simulador/recibir","eventos":["proyecto.*"],"secreto":"secreto-del-cliente-1"}'

# 2. firmar un webhook como si fueramos la granja
BODY='{"id":"evt_1","tipo":"render.iniciado","datos":{"proyectoId":"casa-lago"}}'
FIRMA=$(node -e 'import("./src/webhooks/firma.js").then(m=>console.log(m.firmar(process.argv[1],process.argv[2])))' "secreto-de-desarrollo" "$BODY")
curl -X POST localhost:4022/webhooks/granja -H "Content-Type: application/json" -H "X-Firma: $FIRMA" -d "$BODY"

# 3. ver lo que recibio el cliente
curl localhost:4022/simulador/recibidos
```

## Estructura

```text
src/
├── app.js
├── server.js
├── webhooks/
│   ├── firma.js     firmar y verificar (hmac, tiempo, timingSafeEqual)
│   └── emisor.js    suscripciones, entregas, reintentos y muertos
└── servicios/proyectos.js   estados del proyecto segun los eventos
```
