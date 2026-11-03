# Avanzado 08 - event emitter

API de pedidos de hiperdeportivos hecha con Node.js y Express. Cuando
pasa algo con un pedido se **publica un evento** y otras partes del
sistema reaccionan por su cuenta, usando el `EventEmitter` de Node.

## La idea

Sin eventos, el servicio de pedidos tendria que llamar al inventario, al
de correos y a la auditoria uno por uno. Si se agrega algo nuevo (por
ejemplo metricas) hay que tocar el servicio de pedidos.

Con eventos:

```text
pedidos.crear()  --publica-->  "pedido.creado"
                                    |-> inventario  (reserva, publica "confirmado" o "rechazado")
                                    |-> auditoria   (guarda todo, escucha "*")
"pedido.confirmado"                 |-> pedidos     (cambia el estado)
                                    |-> notificaciones (manda un correo, async)
```

El servicio de pedidos no conoce a nadie: solo publica. Para agregar algo
nuevo se suscribe un modulo mas.

## El bus (`src/eventos/bus.js`)

Extiende `EventEmitter` y agrega:

| Que                        | Por que                                                     |
| -------------------------- | ----------------------------------------------------------- |
| Lista de `EVENTOS`         | Publicar `"pedido.creaddo"` (typo) da error en vez de no hacer nada |
| Mensaje con `id`, `evento`, `datos`, `fecha` | Todos los suscriptores reciben lo mismo y se puede auditar |
| `suscribir(evento, nombre, fn)` | Envuelve al suscriptor en try/catch: si uno falla, los demas siguen y quien publico no se entera. El error queda en `bus.errores` con el nombre del suscriptor |
| Errores async              | Si el suscriptor es `async`, tambien atrapa el error de la promesa |
| Comodin `"*"`              | El EventEmitter no tiene comodin; el bus emite cada mensaje tambien a `"*"` |
| Devuelve como desuscribirse | `const salir = bus.suscribir(...); salir();`               |
| `setMaxListeners(50)`      | Para no ver el aviso de memory leak con mas de 10 suscriptores |

### Cosas que aprendi del EventEmitter

- **`emit` es sincrono.** Llama a cada suscriptor en orden y recien
  despues sigue. Por eso cuando `POST /api/pedidos` responde, el
  inventario ya confirmo el pedido y la respuesta sale `"confirmado"`.
- **Los suscriptores async no se esperan.** El correo tarda, pero la
  respuesta no lo espera. Un test con un correo de 100ms lo comprueba.
- **El orden de los eventos anidados.** El inventario publica
  `pedido.confirmado` *mientras* atiende `pedido.creado`. Al principio el
  bus avisaba a `"*"` al final y la auditoria veia `confirmado` antes que
  `creado`. Lo arregle avisando primero a `"*"` y despues a los del
  evento. Hay un test para eso.
- `events.once(bus, "evento")` devuelve una promesa: sirve para esperar un
  evento en los tests.

### Limitaciones

- Todo pasa dentro de un proceso y en memoria. Si el servidor se cae
  entre un evento y otro, se pierde. Entre servicios distintos se usa un
  broker (RabbitMQ, Kafka).
- Un error en un suscriptor queda registrado pero no se reintenta (eso
  seria una cola, como en el avanzado 06).

## Estados del pedido

```text
creado -> confirmado -> en_produccion -> entregado
   |          |
   |          +-> cancelado (devuelve la unidad al inventario)
   +-> rechazado (sin stock)
```

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                        |
| ------------- | ---------------------------------- |
| `npm start`   | Servidor en http://localhost:4008  |
| `npm run dev` | Servidor con recarga automatica    |
| `npm test`    | Tests del bus y de la API          |

## Endpoints

| Metodo | Ruta                          | Descripcion                                |
| ------ | ----------------------------- | ------------------------------------------ |
| GET    | `/health`                     | El servidor vive                           |
| GET    | `/api/modelos`                | Modelos que se pueden pedir                |
| POST   | `/api/pedidos`                | `{ modelo, cliente, email }`               |
| GET    | `/api/pedidos`                | Todos los pedidos                          |
| GET    | `/api/pedidos/:id`            | Un pedido                                  |
| POST   | `/api/pedidos/:id/avanzar`    | confirmado -> en_produccion -> entregado   |
| POST   | `/api/pedidos/:id/cancelar`   | Cancela un creado o confirmado             |
| GET    | `/api/eventos`                | Lo que guardo la auditoria, `?pedidoId=`   |
| GET    | `/api/inventario`             | Unidades disponibles                       |
| GET    | `/api/notificaciones`         | Correos enviados                           |
| GET    | `/api/bus`                    | Cuantos escuchan cada evento y errores     |

Stock inicial: Bugatti Chiron 2, Koenigsegg Jesko 1, Pagani Utopia 1,
McLaren W1 3, Rimac Nevera 0.

## Ejemplo (PowerShell)

```bash
curl.exe -X POST http://localhost:4008/api/pedidos -H "Content-Type: application/json" -d '{\"modelo\":\"Koenigsegg Jesko\",\"cliente\":\"Ana Torres\",\"email\":\"ana@correo.com\"}'
```

```json
{ "ok": true, "data": { "id": 1, "modelo": "Koenigsegg Jesko", "cliente": "Ana Torres", "email": "ana@correo.com", "estado": "confirmado", "motivo": null } }
```

```bash
curl.exe "http://localhost:4008/api/eventos?pedidoId=1"
```

```json
{
  "ok": true,
  "data": [
    { "id": 1, "evento": "pedido.creado", "datos": { "pedidoId": 1, "modelo": "Koenigsegg Jesko", "email": "ana@correo.com" }, "fecha": "..." },
    { "id": 2, "evento": "pedido.confirmado", "datos": { "pedidoId": 1, "modelo": "Koenigsegg Jesko", "email": "ana@correo.com" }, "fecha": "..." }
  ]
}
```

## Tests

- `test/bus.test.js`: orden sincrono, forma del mensaje, evento que no
  existe, orden con eventos anidados, `"*"`, suscriptor que falla (sync y
  async), desuscribirse, `events.once`.
- `test/api.test.js`: crear y confirmar en la misma peticion, rechazo sin
  stock, correo async que no frena la respuesta, avanzar hasta entregado,
  cancelar devuelve la unidad, correo caido que no rompe el pedido,
  resumen del bus, 400/404/409.

```text
ℹ tests 17
ℹ pass 17
ℹ fail 0
```

Los corri 3 veces seguidas. Para comprobar que sirven volvi a poner el
orden viejo (`"*"` al final) y fallaron 3 tests, entre ellos
`* ve los eventos en el orden real aunque un suscriptor publique otro adentro`.

## Casos de error

| Caso                            | Status | Mensaje                                       |
| ------------------------------- | ------ | --------------------------------------------- |
| Body invalido                   | 400    | `Datos invalidos` + lista `errors`            |
| Pedido que no existe            | 404    | `No existe el pedido 9`                       |
| Avanzar un pedido entregado     | 409    | `Un pedido "entregado" no puede avanzar`      |
| Cancelar un rechazado           | 409    | `Un pedido "rechazado" ya no se puede cancelar` |
| Falla un suscriptor             | (nada) | El pedido sigue; el error queda en `GET /api/bus` |
