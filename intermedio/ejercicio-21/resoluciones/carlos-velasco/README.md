# INTERMEDIO 21 - Rate limit conceptual (window slide en memoria)

## Objetivo

Crear una API Node.js con Express que proteja los endpoints costosos con un rate limiter propio de ventana deslizante, sin dependencias: maximos peticiones por clave con respuesta 429 y `Retry-After`.

## Concepto principal

Un rate limiter decide si una peticion pasa contando las peticiones de una **clave** (IP, token, usuario) en una ventana de tiempo.

Comparacion de estrategias:

| Estrategia     | Descripcion                        | Problema                              |
| -------------- | ---------------------------------- | ------------------------------------- |
| Contador fijo  | contador ignorado al cambiar ventana de tiempo | se pasan hasta 2x maximo en el borde |
| Ventana deslizante (esta impl.) | guarda timestamps reales y cuenta los "ultimos N ms" siempre | consumo de memoria (se limpia por cada request) |

La respuesta 429 incluye los headers estandar del caso:

- `RateLimit-Limit`: maximo solicitado.
- `RateLimit-Remaining`: restantes antes del 429 (en respuestas 200/2xx).
- `Retry-After`: segundos para volver a intentar.
- `RateLimit-Reset`: igual, pero para clientes allend del Retry-After convencional.

Diseño: el limitador solo protege `POST /renders` (encola trabajo real); las consultas GET ilimitadas regidas en otro límite.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   ├── rate.limiter.js
    │   └── error.handler.js
    ├── routes/
    │   └── render.routes.js
    ├── controllers/
    │   └── render.controller.js
    └── services/
        └── render.service.js
```

## Como ejecutar (y romper el limite a proposito)

```bash
npm install
npm run start

# Disparar 6 peticiones seguidas en < 10 s: la sexta devuelve 429
for i in 1 2 3 4 5 6; do \
  curl -s -o /dev/null -w "$i -> %{http_code}\n" \
  -X POST http://localhost:3000/renders \
  -H "Content-Type: application/json" \
  -d '{"escena": "Escena Sol", "frames": 240, "prioridad": "normal"}'; \
done
```

## Ejemplos de peticiones

```bash
# Consulta sin limite
curl http://localhost:3000/renders

# Encolar con la peticion 4 calcula: los headers restantes
curl -i -X POST http://localhost:3000/renders \
  -H "Content-Type: application/json" \
  -d '{"escena": "Nube Olas", "frames": 120, "prioridad": "alta"}'

# Reintento despues del 429 respetando Retry-After
sleep 11 && curl -s -o /dev/null -w "%{http_code}\n" \
  -X POST http://localhost:3000/renders \
  -H "Content-Type: application/json" \
  -d '{"escena": "Escena Dos", "frames": 60}'
```

## Punto clave

El limiter es un middleware reutilizable: se monta cribando **antes del handler** del endpoint costoso, con sus propios maximos y ventanas (se pueden definir distintos por ruta).
