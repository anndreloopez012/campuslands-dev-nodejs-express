# INTERMEDIO 20 - CORS controlado (implementado a mano)

## Objetivo

Crear una API Node.js con Express que controle el acceso desde otros origenes con un middleware CORS propio: whitelist de origenes, preflight OPTIONS, headers permitidos y sin paquete externo.

## Concepto principal

CORS es un **acuerdo del navegador**: el servidor declara peticiones (headers) que permites y el navegador las vigila.

1. Peticiones "simples" (GET sin headers custom): alcanza con `Access-Control-Allow-Origin`.
2. Peticiones que llevan JSON/u otros headers: el navegador primero pregunta con `OPTIONS` (preflight). El middleware responde 204 con:
   - `Access-Control-Allow-Origin`
   - `Access-Control-Allow-Methods`
   - `Access-Control-Allow-Headers`
   - `Access-Control-Max-Age` (segundos que el navegador recuerda el permiso)

Detalle del diseno:

- La whitelist (`allowOrigins`) define que origenes se pueden comunicar; si el `Origin` no esta, sencillamente **no se emiten** los headers y el navegador bloquea el acceso.
- `Access-Control-Allow-Credentials` solo se declara con origen explicito: el comodin `*` no admite credenciales segun el estandar.
- `Vary: Origin` para cachear la respuesta correcta en proxys.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── data/
    │   └── lienzos.data.js
    ├── middlewares/
    │   ├── cors.middleware.js
    │   └── error.handler.js
    ├── routes/
    │   └── canvas.routes.js
    ├── controllers/
    │   └── canvas.controller.js
    └── services/
        └── canvas.service.js
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
| GET | /health | Estado del servidor (publico por GET simple) | 200 |
| GET | /lienzos | Lista de lienzos | 200 |
| POST | /lienzos | Crea lienzo (necesita preflight por Content-Type JSON) | 201 / 400 |
| PATCH | /lienzos/:id | Cambia titulo | 200 / 404 |

## Ejemplos de peticiones (simulando un navegador)

```bash
# GET desde un origen permitido -> respuesta con CORS headers
curl -i -H "Origin: http://localhost:5173" http://localhost:3000/lienzos

# GET desde un origen NO permitido -> responde, pero SIN header Allow-Origin
# (el navegador bloquearia la respuesta por politica del mismo origen)
curl -i -H "Origin: http://merluzo-impostor.com" http://localhost:3000/lienzos

# Preflight del POST simulado: requiere origen valido; el preflight responde 204 con permisos
curl -i -X OPTIONS http://localhost:3000/lienzos \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type"

# Preflight del PATCH con mismo origen valido
curl -i -X OPTIONS http://localhost:3000/lienzos/1 \
  -H "Origin: https://estudio-arte.dev" \
  -H "Access-Control-Request-Method: PATCH"

# Una vez aprobado el preflight, la peticion real
curl -X POST http://localhost:3000/lienzos \
  -H "Origin: http://localhost:5173" \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Cuadro Nebular", "estilo": "pixel", "capas": 8}'
```

## Punto clave

CORS no protege la API: es un mecanismo para autorizar a **navegadores de terceros**. Igual hay que restringirlo (whitelist) para no abrir el canon anyorigen.
