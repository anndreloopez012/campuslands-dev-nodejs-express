# INTERMEDIO 08 - Middleware de request id

## Objetivo

Crear una API Node.js con Express donde cada peticion reciba un identificador unico trazable del extremo al extremo, conservado en logs, headers y cuerpo de respuesta.

## Concepto principal

Un **request id** permite seguir una peticion individual a traves de todos los logs del sistema (y de proxies). El middleware unificado:

1. Lee `x-request-id` si un proxy lo envio (`req.headers['x-request-id']`), valida su tamano (max 100) y lo reutiliza.
2. Si no existe, genera uno con `crypto.randomUUID()`.
3. Guarda `req.requestId`, responde `x-response-id` y libera header en cada respuesta.
4. Registra en consola al finalizar: `[id] METODO /ruta -> status (ms)`.

Asi el cliente, el proxy y el servidor citan el mismo identificador para el caso de los mismos problemas.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── middlewares/
    │   └── request.id.js
    ├── routes/
    │   └── hypercar.routes.js
    ├── controllers/
    │   └── hypercar.controller.js
    └── services/
        └── hypercar.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Endpoints

| Metodo | Ruta | Descripcion | Codigo |
| ------ | ---- | ----------- | ------ |
| GET | /health | Verifica el estado del servidor | 200 |
| GET | /hypercars | Lista hiperdeportivos | 200 |
| GET | /hypercars/:id | Detalle por id | 200 / 404 |
| POST | /hypercars | Registra un hiperdeportivo | 201 / 400 |

## Ejemplos de peticiones

```bash
# Sin header: el servidor genera y devuelve el id
curl -i http://localhost:3000/hypercars

# Con id propia: se respeta y se devuelve en x-response-id
curl -i -H "x-request-id: session-2026-abc-77" http://localhost:3000/health

# El cuerpo de respuesta tambien lo incluye para correlacionar logs
curl http://localhost:3000/hypercars/1 | head -c 400

# Caso de error: el id de la peticion fallida se ve igual en log y respuesta
curl -i http://localhost:3000/hypercars/999

# Registrar hiperdeportivo
curl -X POST http://localhost:3000/hypercars \
  -H "Content-Type: application/json" \
  -d '{"modelo": "Fulado GT", "potencia_hp": 1500, "velocidad_max": 450, "precio_usd": 3200000}'
```

## Salida esperada en logs

```text
[c0b9ac0e-6f16-4fa2-b9a7-7e00d0b04a12] GET /hypercars -> 200 (12 ms)
[session-2026-abc-77] GET /health -> 200 (2 ms)
```

## Punto clave

El middleware corre primero en el pipeline, asi que cualquier error posterior también lleva el mismo id: puedes preguntar al cliente "enviame tu requestId" y reconstruir toda la peticion en los logs.
