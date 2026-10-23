# Ejercicio 05 — fs para leer archivos

**Temática:** fútbol y fútbol sala · **Nivel:** Básico inicial

## Objetivo

Leer archivos del disco con el módulo `fs` (versión de promesas), parsear JSON y texto plano, y manejar errores de lectura como `ENOENT`.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`).

## Estructura

```text
ejercicio-05/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── data/
│   │   ├── matches.json
│   │   └── stadiums.txt
│   ├── routes/index.js
│   ├── controllers/files.controller.js
│   └── services/files.service.js
└── test/app.test.js
```

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-05` | Endpoint principal | 200 |
| GET | `/matches` | Lee `matches.json` y lo devuelve parseado | 200, 500 |
| GET | `/stadiums` | Lee `stadiums.txt` línea por línea | 200 |
| GET | `/files/:name` | Tamaño, líneas y fecha de modificación (`matches`, `stadiums`, `ghost`) | 200, 404 |

## Ejemplos

```bash
curl http://localhost:3000/matches
curl http://localhost:3000/stadiums
curl http://localhost:3000/files/stadiums
curl -i http://localhost:3000/files/ghost     # 404: el archivo no existe en disco
curl -i http://localhost:3000/files/otro      # 404: no está registrado
```

## Decisiones

- Se usa `fs/promises` con `async/await`, que no bloquea el servidor (a diferencia de `readFileSync`).
- Las rutas se construyen con `path.join(__dirname, ...)` para no depender de desde dónde se ejecute `node`.
- Solo se pueden leer archivos de un **catálogo fijo**; el cliente nunca elige una ruta libre (eso se profundiza en el ejercicio 06).
- `ghost` está registrado pero no existe, a propósito, para demostrar el manejo de `ENOENT`.

## Errores manejados

- `ENOENT` → `404` con mensaje claro.
- JSON inválido en `matches.json` → `500` sin exponer detalles internos.
- Ruta desconocida → `404`.

## Pruebas

```bash
npm test
```
