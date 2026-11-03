# Avanzado 20 - idempotencia (dibujo digital)

Tienda de encargos de ilustraciones digitales que se pagan con creditos. Si el cliente da doble click, se le cae el internet y reintenta, o el celular manda el pedido dos veces, **no se le puede cobrar dos veces**. Para eso el `POST` usa el header `Idempotency-Key`.

## Como ejecutar

```bash
npm install
npm start      # http://localhost:4020
npm test
```

## Como funciona

1. El cliente genera una llave unica por operacion (por ejemplo un UUID) y la manda en `Idempotency-Key`.
2. La primera vez se aparta la llave (`en_proceso`), se cobra y se guarda la respuesta (`completo`).
3. Si vuelve a llegar la misma llave con el mismo body, se devuelve **la misma respuesta guardada** con `Idempotency-Replayed: true`, sin cobrar.

| Caso | Respuesta |
| ---- | --------- |
| sin llave o llave con formato raro | 400 |
| misma llave, mismo body, ya termino | la respuesta guardada (mismo status y body) |
| misma llave mientras el primero sigue procesando | 409 + `Retry-After: 1` |
| misma llave con **otro** body | 422 |
| la ruta respondio 4xx (ej. 402 sin creditos) | se guarda, repetir da lo mismo |
| la ruta respondio 5xx | NO se guarda, se suelta la llave para reintentar |
| paso el TTL (24 h) | la llave se puede volver a usar |

- La llave es **por usuario** (`usuario:llave`), dos clientes no se pisan.
- La huella del pedido es un sha256 de `metodo + ruta + body`.
- `GET` no necesita llave porque ya es idempotente.

## Endpoints

| Metodo | Ruta | Headers |
| ------ | ---- | ------- |
| GET | `/health` | |
| GET | `/api/encargos` | `X-Usuario` |
| POST | `/api/encargos` | `X-Usuario`, `Idempotency-Key` |

Usuarios de prueba: `ana` (200 creditos) y `beto` (30 creditos).
Precios: boceto 20, lineart 45, color 80, animado 150 (por personaje).

## Ejemplos

```bash
curl -i -X POST localhost:4020/api/encargos \
  -H "X-Usuario: ana" -H "Idempotency-Key: 6f1c2e8a-encargo-1" -H "Content-Type: application/json" \
  -d '{"estilo":"color","descripcion":"Dragon de acuarela digital"}'

# repetir EXACTO: mismo 201, Idempotency-Replayed: true, saldo igual
curl -i -X POST localhost:4020/api/encargos \
  -H "X-Usuario: ana" -H "Idempotency-Key: 6f1c2e8a-encargo-1" -H "Content-Type: application/json" \
  -d '{"estilo":"color","descripcion":"Dragon de acuarela digital"}'

curl localhost:4020/api/encargos -H "X-Usuario: ana"
```

## Estructura

```text
src/
├── app.js
├── server.js
├── idempotencia/
│   ├── almacen.js      llaves, estados y TTL
│   └── middleware.js   lee la llave, responde repetidos y guarda la respuesta
└── servicios/encargos.js   creditos y pasarela de pago simulada
```
