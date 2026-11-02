# Ejercicio 09 — JSON y persistencia simple

**Temática:** kickboxing · **Nivel:** Básico inicial

## Objetivo

Guardar datos en un archivo JSON para que sobrevivan al reinicio del servidor: leer con `JSON.parse`, escribir con `JSON.stringify` y manejar archivo ausente, JSON corrupto y escrituras simultáneas.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`). Los datos viven en `src/data/fighters.json`.

## Estructura

```text
ejercicio-09/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── data/fighters.json
│   ├── routes/index.js
│   ├── controllers/fighters.controller.js
│   └── services/fighters.service.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-09` | Endpoint principal | 200 |
| GET | `/fighters` | Lista de peleadores | 200 |
| GET | `/fighters/:id` | Detalle | 200, 400, 404 |
| POST | `/fighters` | Crea y **persiste** un peleador | 201, 400, 409 |

## Ejemplos

```bash
curl http://localhost:3000/fighters

curl -X POST http://localhost:3000/fighters \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana Solis","weightClass":"peso gallo","wins":5,"losses":0}'
```

Respuesta (`201 Created`):

```json
{
  "ok": true,
  "fighter": { "id": 3, "name": "Ana Solis", "weightClass": "peso gallo", "wins": 5, "losses": 0 }
}
```

Reinicia el servidor y vuelve a consultar `GET /fighters`: el nuevo peleador sigue ahí.

Respuesta de validación (`400`):

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "details": ["name debe ser texto de 2 a 60 caracteres", "wins debe ser un entero mayor o igual a 0"]
}
```

## Decisiones de persistencia

- Si el archivo no existe, se asume una lista vacía; si está corrupto, se responde `500` sin exponer detalles.
- La escritura es **atómica**: se escribe un archivo temporal y se renombra, para no dejar el JSON a medias si el proceso se interrumpe.
- Una **cola de escritura** (`withLock`) serializa las operaciones, así dos `POST` simultáneos no se sobrescriben.
- Las pruebas usan un archivo temporal mediante la variable `FIGHTERS_FILE`, sin tocar los datos reales.

## Errores manejados

| Caso | Código |
| --- | --- |
| Cuerpo con JSON mal formado | 400 |
| Campos inválidos (`name`, `weightClass`, `wins`, `losses`) | 400 |
| Nombre duplicado | 409 |
| Peleador inexistente | 404 |
| Archivo de datos corrupto | 500 |

## Pruebas

```bash
npm test
```
