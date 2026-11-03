# Avanzado 30 - proyecto final avanzado (motos y mecanica)

API de un **taller de motos**: recepcion recibe la moto, el mecanico la diagnostica y repara usando repuestos del inventario, recepcion cobra y la entrega. Junta lo que se practico en el nivel avanzado:

- capas: rutas -> controladores -> servicios -> datos
- login con **JWT** y claves con **scrypt**
- **roles** (recepcion, mecanico, admin)
- **maquina de estados** de la orden con permisos por paso
- **inventario** con reservas
- **pago idempotente** con `Idempotency-Key`
- **auditoria** de cada cambio
- validacion, paginacion y config validada
- **apagado ordenado**
- tests de integracion

## Como ejecutar

```bash
cp .env.example .env    # referencia de las variables
npm install
npm start      # http://localhost:4030
npm test
```

Usuarios de prueba:

| Usuario | Clave | Rol |
| ------- | ----- | --- |
| `rosa` | `recepcion123` | recepcion |
| `beto` | `mecanico123` | mecanico |
| `ana` | `admin12345` | admin |

## Ciclo de una orden

```text
recibida --(mecanico)--> diagnostico --(mecanico)--> esperando_repuestos --(mecanico)--> en_reparacion
                                     \------------------(mecanico)----------------------/      |
                                                                                    (mecanico, con mano de obra)
                                                                                               v
             cancelada <--(recepcion, con motivo)-- [recibida, diagnostico, esperando_repuestos]   lista
                                                                                               | (recepcion, ya pagada)
                                                                                               v
                                                                                           entregada
```

- Saltar pasos o volver atras -> **409**. Rol que no puede -> **403**. Admin puede todos los pasos validos.
- `lista` necesita mano de obra registrada. `entregada` necesita el pago.
- Una moto no puede tener dos ordenes abiertas.

## Inventario

- Al agregar un repuesto a la orden se **reserva** (`disponible = stock - reservado`). Si no alcanza -> 409, contando lo reservado por otras ordenes.
- El precio se **copia** a la orden (si despues sube, la orden no cambia).
- Cancelar **libera** la reserva. Entregar **descuenta** del stock.
- `GET /api/repuestos?bajoStock=true` lista lo que esta debajo del minimo. Solo admin ajusta el stock (con motivo).

## Dinero

Todo en **centavos** (enteros) para no tener errores de decimales:

```text
total = repuestos + horas * TARIFA_HORA (15000 = Q150) + IVA 12 %
```

El pago tiene que ser exactamente el total. Las horas van en cuartos de hora (0.25, 1.5...).

## Pago idempotente

`POST /api/ordenes/:id/pago` pide `Idempotency-Key`:

- La primera vez responde 201.
- Si se repite con la misma llave y los mismos datos responde 200 con la misma respuesta, `Idempotency-Replayed: true` y **no cobra otra vez**.
- La misma llave con otros datos responde **422**.

## Seguridad

- Las claves se guardan con `scrypt` y sal, y se comparan con `timingSafeEqual`. Si el usuario no existe igual se calcula un hash, y responde el mismo 401 para no dar pistas.
- El JWT dura 1h y lleva `issuer`. Solo se acepta `HS256`.
- En production `JWT_SECRETO` es obligatorio (32+ caracteres).
- Sin `X-Powered-By`, con `nosniff` y `X-Request-Id`, y el body maximo es de 20kb.
- Los 500 no muestran detalles al cliente.

## Endpoints

| Metodo | Ruta | Quien |
| ------ | ---- | ----- |
| GET | `/health` | todos |
| POST | `/api/auth/login` | todos |
| GET | `/api/auth/yo` | con token |
| GET | `/api/motos?marca=&clienteId=&pagina=&limite=` | con token |
| POST | `/api/motos` | recepcion |
| GET | `/api/repuestos?bajoStock=true` | con token |
| PATCH | `/api/repuestos/:id/stock` | admin |
| GET | `/api/ordenes?estado=&placa=&pagina=&limite=` | con token |
| POST | `/api/ordenes` | recepcion |
| GET | `/api/ordenes/:id` | con token |
| GET | `/api/ordenes/:id/historial` | con token |
| POST | `/api/ordenes/:id/estado` | segun el paso |
| POST | `/api/ordenes/:id/repuestos` | mecanico |
| POST | `/api/ordenes/:id/mano-de-obra` | mecanico |
| POST | `/api/ordenes/:id/pago` | recepcion |

## Probar el flujo con curl

```bash
TR=$(curl -s -X POST localhost:4030/api/auth/login -H "Content-Type: application/json" -d '{"usuario":"rosa","clave":"recepcion123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).data.token')
TM=$(curl -s -X POST localhost:4030/api/auth/login -H "Content-Type: application/json" -d '{"usuario":"beto","clave":"mecanico123"}' | node -pe 'JSON.parse(require("fs").readFileSync(0)).data.token')

curl -X POST localhost:4030/api/ordenes -H "Authorization: Bearer $TR" -H "Content-Type: application/json" -d '{"motoId":1,"problema":"Ruido en la cadena y frena mal","kilometraje":15200}'
curl -X POST localhost:4030/api/ordenes/1/estado -H "Authorization: Bearer $TM" -H "Content-Type: application/json" -d '{"estado":"diagnostico"}'
curl -X POST localhost:4030/api/ordenes/1/estado -H "Authorization: Bearer $TM" -H "Content-Type: application/json" -d '{"estado":"en_reparacion"}'
curl -X POST localhost:4030/api/ordenes/1/repuestos -H "Authorization: Bearer $TM" -H "Content-Type: application/json" -d '{"repuestoId":2,"cantidad":1}'
curl -X POST localhost:4030/api/ordenes/1/mano-de-obra -H "Authorization: Bearer $TM" -H "Content-Type: application/json" -d '{"horas":1.5,"descripcion":"Cambio de pastillas"}'
curl -X POST localhost:4030/api/ordenes/1/estado -H "Authorization: Bearer $TM" -H "Content-Type: application/json" -d '{"estado":"lista"}'
# total = 12000 + 22500 = 34500 + IVA 4140 = 38640
curl -X POST localhost:4030/api/ordenes/1/pago -H "Authorization: Bearer $TR" -H "Idempotency-Key: caja-1-000001" -H "Content-Type: application/json" -d '{"monto":38640,"metodo":"efectivo"}'
curl -X POST localhost:4030/api/ordenes/1/estado -H "Authorization: Bearer $TR" -H "Content-Type: application/json" -d '{"estado":"entregada"}'
curl localhost:4030/api/ordenes/1/historial -H "Authorization: Bearer $TR"
```

## Estructura

```text
src/
├── app.js                       arma todo e inyecta dependencias
├── server.js                    listen + apagado ordenado
├── config.js
├── routes/index.js              rutas y permisos de entrada
├── controllers/
│   ├── ordenes.controller.js
│   └── taller.controller.js     auth, motos, repuestos
├── services/
│   ├── auth.service.js          scrypt + JWT
│   ├── ordenes.service.js       maquina de estados, totales, pago idempotente
│   ├── repuestos.service.js     reservar, liberar, consumir
│   ├── motos.service.js
│   └── auditoria.service.js
├── middlewares/
│   ├── autenticar.js            Bearer token y roles
│   └── errores.js
├── data/store.js                datos iniciales en memoria
└── utils/errores.js             ErrorApp, ids y paginacion
test/
├── ayuda.js                     app nueva + login de cada rol
├── reglas.test.js               estados y totales (unitarios)
└── taller.test.js               integracion de punta a punta
```
