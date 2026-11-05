# Intermedio 30 - proyecto integrador intermedio

API de un taller de motos y mecanica que junta lo practicado en el nivel intermedio: autenticacion con roles, validacion, arquitectura por capas, reglas de negocio, maquina de estados, inventario, paginacion, manejo de errores y pruebas.

## Que hace

- Inicio de sesion con token firmado (HMAC) y tres roles: `admin`, `recepcion` y `mecanico`.
- Clientes, motos y repuestos con validaciones, busquedas, filtros y paginacion.
- Ordenes de trabajo con ciclo de vida: `recibida`, `asignada`, `en_reparacion`, `lista`, `entregada` y `cancelada`.
- Descuento y devolucion de inventario segun los repuestos usados, mano de obra por horas y factura.
- Cada mecanico solo ve y modifica sus propias ordenes.
- Reporte de resumen del taller para el administrador.

## Estructura

```text
.
|-- package.json
|-- README.md
|-- soporte/
|   |-- cliente.js
|   `-- taller.js
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- config/
|   |-- constants/
|   |-- controllers/
|   |-- data/
|   |-- middlewares/
|   |-- repositories/
|   |-- routes/
|   |-- services/
|   |-- utils/
|   `-- validators/
`-- test/
```

## Como ejecutar

```bash
npm install
npm run dev
```

El servidor queda en `http://localhost:3000`. Para otro puerto: `PORT=4000 npm start` (en PowerShell: `$env:PORT=4000; npm start`).

Variables opcionales: `TOKEN_SECRET` (clave para firmar los tokens; cambiala fuera de desarrollo) y `TOKEN_TTL_SEG` (duracion del token en segundos, 3600 por defecto).

## Como correr las pruebas

```bash
npm test
npm run test:cobertura
```

## Respuesta esperada

`GET /intermedio/ejercicio-30`

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "proyecto integrador intermedio"
}
```

## Usuarios de prueba

| Usuario | Password | Rol |
| --- | --- | --- |
| admin | Admin2026 | admin |
| lucia | Recepcion2026 | recepcion |
| carlos | Taller2026 | mecanico |
| marta | Taller2026 | mecanico |
| pedro | Taller2026 | mecanico (desactivado) |

Son datos de demostracion. Las passwords se guardan con `scrypt` y sal, nunca en texto plano.

## Quien puede hacer que

| Accion | admin | recepcion | mecanico |
| --- | --- | --- | --- |
| Consultar clientes, motos, repuestos y mecanicos | si | si | si |
| Crear y editar clientes y motos | si | si | no |
| Crear, editar y reabastecer repuestos | si | no | no |
| Crear y asignar ordenes, ver facturas | si | si | no |
| Consultar ordenes | todas | todas | solo las suyas |
| Iniciar reparacion, marcar lista, agregar repuestos y horas | si | no | solo en sus ordenes |
| Entregar o cancelar una orden | si | si | no |
| Resumen del taller | si | no | no |

## Ciclo de una orden

```text
recibida -> asignada -> en_reparacion -> lista -> entregada
    |           |             |
    +-----------+-------------+--> cancelada
```

- `asignada` se logra con `PUT /ordenes/:id/asignacion`; se puede reasignar mientras no empiece la reparacion.
- Los repuestos y las horas solo se registran cuando la orden esta `en_reparacion`.
- Cancelar devuelve al inventario todos los repuestos de la orden.
- Una moto no puede tener dos ordenes abiertas al mismo tiempo.
- El precio de cada linea queda guardado al agregarla: si el repuesto cambia de precio despues, la orden no cambia.
- Total = repuestos + horas x tarifa (45 por hora).

## Endpoints

Todas las rutas cuelgan de `/intermedio/ejercicio-30` y, salvo la principal y el login, requieren `Authorization: Bearer <token>`.

| Metodo | Ruta | Descripcion | Exito |
| --- | --- | --- | --- |
| GET | `/` | Endpoint principal (publico) | 200 |
| POST | `/auth/login` | Inicia sesion (publico) | 200 |
| GET | `/auth/yo` | Usuario del token | 200 |
| GET | `/clientes` | Lista clientes | 200 |
| POST | `/clientes` | Crea un cliente | 201 |
| GET | `/clientes/:id` | Detalle | 200 |
| PATCH | `/clientes/:id` | Edita parcialmente | 200 |
| GET | `/motos` | Lista motos | 200 |
| POST | `/motos` | Registra una moto | 201 |
| GET | `/motos/:id` | Detalle | 200 |
| PATCH | `/motos/:id` | Edita parcialmente (no la placa) | 200 |
| GET | `/repuestos` | Lista repuestos | 200 |
| POST | `/repuestos` | Crea un repuesto | 201 |
| GET | `/repuestos/:id` | Detalle | 200 |
| PATCH | `/repuestos/:id` | Edita nombre o precio | 200 |
| POST | `/repuestos/:id/reabastecer` | Suma stock | 200 |
| GET | `/ordenes` | Lista ordenes | 200 |
| POST | `/ordenes` | Abre una orden | 201 |
| GET | `/ordenes/:id` | Detalle con items, totales e historial | 200 |
| PUT | `/ordenes/:id/asignacion` | Asigna un mecanico | 200 |
| PUT | `/ordenes/:id/estado` | Cambia el estado | 200 |
| POST | `/ordenes/:id/items` | Agrega un repuesto | 201 |
| DELETE | `/ordenes/:id/items/:repuestoId` | Quita un repuesto | 200 |
| POST | `/ordenes/:id/horas` | Suma horas de mano de obra | 200 |
| GET | `/ordenes/:id/factura` | Factura de una orden lista o entregada | 200 |
| GET | `/mecanicos` | Mecanicos activos y su carga | 200 |
| GET | `/reportes/resumen` | Resumen del taller | 200 |

## Campos del body

| Recurso | Campo | Regla |
| --- | --- | --- |
| login | usuario, password | Obligatorios |
| cliente | nombre | 3 a 60 caracteres |
| cliente | telefono | 8 digitos, unico |
| cliente | email | Opcional, email valido |
| moto | clienteId | Cliente existente |
| moto | placa | 5 a 7 letras o numeros, se guarda en mayusculas, unica |
| moto | marca, modelo | Texto |
| moto | cilindraje | Entero de 50 a 2000 |
| moto | anio | Entero de 1980 a 2030 |
| repuesto | codigo | 3 a 12 letras, numeros o guion, se guarda en mayusculas, unico |
| repuesto | nombre | 3 a 60 caracteres |
| repuesto | precio | Numero de 0.01 a 100000 |
| repuesto | stock | Entero de 0 a 100000 |
| reabastecer | cantidad | Entero de 1 a 10000 |
| orden | motoId | Moto existente sin otra orden abierta |
| orden | descripcion | 5 a 300 caracteres |
| asignacion | mecanicoId | Mecanico activo |
| estado | estado | `en_reparacion`, `lista`, `entregada` o `cancelada` |
| item | repuestoId, cantidad | Repuesto existente, cantidad de 1 a 100 |
| horas | horas | Numero de 0.25 a 100 (acumula hasta 100 por orden) |

Los campos desconocidos se rechazan con 400.

## Parametros de consulta

| Ruta | Parametro | Valores |
| --- | --- | --- |
| /clientes | buscar, orden | Parte del nombre; `id`, `nombre` |
| /motos | clienteId, buscar, orden | Entero; parte de placa, marca o modelo; `id`, `placa`, `anio` |
| /repuestos | disponible, buscar, orden | `true` o `false`; parte del nombre o codigo; `id`, `nombre`, `precio`, `stock` |
| /ordenes | estado, motoId, mecanicoId, orden | Un estado; enteros; `reciente` (por defecto), `id` |
| todos los listados | pagina, limite | pagina desde 1, limite de 1 a 50 (10 por defecto) |

## Ejemplos

curl:

```bash
curl -X POST http://localhost:3000/intermedio/ejercicio-30/auth/login \
  -H "Content-Type: application/json" \
  -d '{"usuario":"lucia","password":"Recepcion2026"}'

curl http://localhost:3000/intermedio/ejercicio-30/ordenes \
  -H "Authorization: Bearer TU_TOKEN"

curl -X POST http://localhost:3000/intermedio/ejercicio-30/ordenes \
  -H "Authorization: Bearer TU_TOKEN" -H "Content-Type: application/json" \
  -d '{"motoId":2,"descripcion":"Cambio de llanta delantera"}'

curl -X PUT http://localhost:3000/intermedio/ejercicio-30/ordenes/4/asignacion \
  -H "Authorization: Bearer TU_TOKEN" -H "Content-Type: application/json" \
  -d '{"mecanicoId":3}'
```

PowerShell:

```powershell
$login = Invoke-RestMethod -Method Post -Uri http://localhost:3000/intermedio/ejercicio-30/auth/login `
  -ContentType "application/json" `
  -Body '{"usuario":"carlos","password":"Taller2026"}'
$cabecera = @{ Authorization = "Bearer $($login.data.token)" }

Invoke-RestMethod -Uri http://localhost:3000/intermedio/ejercicio-30/ordenes -Headers $cabecera

Invoke-RestMethod -Method Put -Uri http://localhost:3000/intermedio/ejercicio-30/ordenes/3/estado `
  -Headers $cabecera -ContentType "application/json" `
  -Body '{"estado":"en_reparacion"}'
```

### Recorrido completo

1. `lucia` registra al cliente (`POST /clientes`) y su moto (`POST /motos`).
2. `lucia` abre la orden (`POST /ordenes`) y la asigna (`PUT /ordenes/:id/asignacion`).
3. `carlos` pasa la orden a `en_reparacion`, agrega repuestos (`POST /ordenes/:id/items`) y horas (`POST /ordenes/:id/horas`).
4. `carlos` la marca `lista`; `lucia` consulta la factura y la marca `entregada`.
5. `admin` revisa `GET /reportes/resumen`.

Este recorrido esta automatizado en `test/flujo.integrador.test.js`.

## Formato de respuesta

Exito:

```json
{ "ok": true, "data": { "id": 4, "motoId": 2, "estado": "recibida", "total": 0 } }
```

Listados:

```json
{ "ok": true, "data": [], "paginacion": { "pagina": 1, "limite": 10, "total": 0, "totalPaginas": 1 } }
```

Los listados tambien envian `X-Total-Count` y las creaciones `Location`.

Login:

```json
{
  "ok": true,
  "data": {
    "token": "eyJzdWIiOjIsImV4cCI6MTc2MjI1OTIwMH0.firma",
    "tipo": "Bearer",
    "expira": "2026-11-04T13:00:00.000Z",
    "usuario": { "id": 2, "usuario": "lucia", "nombre": "Lucia Morales", "rol": "recepcion" }
  }
}
```

## Errores

```json
{
  "ok": false,
  "message": "Stock insuficiente de PAS-FRE-DL: hay 1 y se piden 2",
  "codigo": "STOCK_INSUFICIENTE"
}
```

| Status | Cuando | Codigos |
| --- | --- | --- |
| 400 | Body, id o consulta invalidos | VALIDACION, CONSULTA_INVALIDA, ID_INVALIDO, JSON_INVALIDO |
| 401 | Falta el token, es invalido o vencio; credenciales incorrectas | NO_AUTENTICADO, TOKEN_INVALIDO, CREDENCIALES_INVALIDAS |
| 403 | El rol no permite la accion o la orden es de otro mecanico | PERMISOS_INSUFICIENTES, ORDEN_AJENA |
| 404 | Recurso o ruta inexistente | CLIENTE_NO_ENCONTRADO, MOTO_NO_ENCONTRADA, REPUESTO_NO_ENCONTRADO, ORDEN_NO_ENCONTRADA, ITEM_NO_ENCONTRADO |
| 405 | Metodo no permitido (incluye `Allow`) | METODO_NO_PERMITIDO |
| 409 | Duplicados y conflictos de estado o inventario | TELEFONO_DUPLICADO, PLACA_DUPLICADA, REPUESTO_DUPLICADO, MOTO_EN_TALLER, TRANSICION_INVALIDA, ORDEN_NO_EDITABLE, STOCK_INSUFICIENTE, ORDEN_SIN_FACTURA |
| 413 | Body de mas de 10 KB | PAYLOAD_GRANDE |
| 415 | El body no es `application/json` | TIPO_NO_SOPORTADO |
| 422 | Referencia inexistente o regla de negocio | REFERENCIA_INVALIDA, HORAS_EXCEDIDAS |
