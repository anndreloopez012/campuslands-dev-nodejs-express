# Taller de Motos - API 

API REST para un taller mecanico de motos, que administra dos recursos
relacionados: motos y ordenes de trabajo. 

## Descripcion

Cada moto tiene placa, marca, modelo y propietario. Cada orden de
trabajo pertenece a una moto (motoId) y tiene una descripcion, un
estado (pendiente, en_proceso, completada) y un costo estimado.
No se puede crear una orden para una moto que no existe: el servicio
valida la relacion y responde 404 si la moto no esta registrada.

Los datos se guardan en src/data/motos.json y
src/data/ordenes.json, y persisten entre reinicios del servidor.

## Requisitos previos

- Node.js 20 o superior.
- npm.

## Instalacion

```bash
cd basico/ejercicio-30/resoluciones/allison-vargas
cp .env.example .env
npm install
```

En PowerShell, en vez de cp:

```powershell
Copy-Item .env.example .env
```

La unica variable de entorno usada es PORT (por defecto 3000 si no
se define).

## Como ejecutar

```bash
npm run dev
```

o sin watch:

```bash
npm start
```

## Estructura del proyecto

```text
.
|-- .env.example
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- config/
    |   `-- index.js
    |-- routes/
    |   |-- ejercicio.routes.js
    |   |-- motos.routes.js
    |   `-- ordenes.routes.js
    |-- controllers/
    |   |-- ejercicio.controller.js
    |   |-- motos.controller.js
    |   `-- ordenes.controller.js
    |-- services/
    |   |-- motos.service.js
    |   `-- ordenes.service.js
    |-- validators/
    |   |-- moto.validator.js
    |   `-- orden.validator.js
    |-- middlewares/
    |   |-- logger.js
    |   `-- errorHandler.js
    |-- utils/
    |   `-- AppError.js
    `-- data/
        |-- motos.json
        `-- ordenes.json
```

## Referencia de la API

### GET /basico/ejercicio-30

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "proyecto integrador basico"
}
```

### Motos

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | /motos | Lista todas las motos |
| GET | /motos/:id | Ve una moto por id |
| POST | /motos | Crea una moto |
| PUT | /motos/:id | Reemplaza una moto existente |
| DELETE | /motos/:id | Elimina una moto |

Body para POST/PUT /motos: placa (string, 3-10 alfanumericos), marca (string), modelo (string), propietario (string). Todos obligatorios.

```bash
curl -X POST http://localhost:3000/basico/ejercicio-30/motos -H "Content-Type: application/json" -d "{\"placa\":\"MNO456\",\"marca\":\"Suzuki\",\"modelo\":\"GN125\",\"propietario\":\"Elena Vidal\"}"
```

### Ordenes de trabajo

| Metodo | Ruta | Descripcion |
|---|---|---|
| GET | /ordenes | Lista todas las ordenes |
| GET | /ordenes/:id | Ve una orden por id |
| GET | /motos/:motoId/ordenes | Lista las ordenes de una moto |
| POST | /motos/:motoId/ordenes | Crea una orden para esa moto |
| PUT | /ordenes/:id/estado | Cambia solo el estado |

Body para POST /motos/:motoId/ordenes: descripcion (string), estado (pendiente/en_proceso/completada), costo_estimado (numero >= 0).

```bash
curl -X POST http://localhost:3000/basico/ejercicio-30/motos/1/ordenes -H "Content-Type: application/json" -d "{\"descripcion\":\"Ajuste de cadena\",\"estado\":\"pendiente\",\"costo_estimado\":15000}"
```

Si motoId no existe, responde 404.

```bash
curl -X PUT http://localhost:3000/basico/ejercicio-30/ordenes/2/estado -H "Content-Type: application/json" -d "{\"estado\":\"en_proceso\"}"
```

## Codigos de estado usados

| Status | Cuando aparece |
|---|---|
| 200 OK | Consulta o actualizacion exitosa |
| 201 Created | Se creo una moto o una orden |
| 204 No Content | Se elimino una moto |
| 400 Bad Request | El body no paso la validacion |
| 404 Not Found | El recurso pedido no existe, o se intento crear una orden para una moto inexistente |
| 500 Internal Server Error | Error inesperado, capturado por el middleware central |

## Como probar

1. Copia .env.example a .env, npm install, npm run dev.
2. Prueba el flujo feliz: crea una moto, crea una orden para esa moto, listala, y cambia su estado.
3. Prueba los errores: moto con datos incompletos (400), moto inexistente (404), orden para moto inexistente (404), ruta que no existe (404 generico).
4. Revisa logs/access.log despues de correr el servidor.

## Limitaciones conocidas

- No hay autenticacion.
- Borrar una moto no borra ni reasigna sus ordenes existentes.
- Los datos viven en archivos JSON planos, no en una base de datos real.
