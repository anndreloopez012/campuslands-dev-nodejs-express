# Fútbol API — Ejercicio 29 (README técnico)

API REST de equipos de **fútbol** y **fútbol sala**, construida con Node.js y Express. Este ejercicio se centra en la **documentación**: el README está escrito para que otra persona pueda instalar, ejecutar, probar y entender el proyecto sin preguntar nada.

## Tabla de contenido

1. [Descripción](#descripción)
2. [Requisitos](#requisitos)
3. [Instalación](#instalación)
4. [Ejecución](#ejecución)
5. [Scripts disponibles](#scripts-disponibles)
6. [Variables de entorno](#variables-de-entorno)
7. [Estructura del proyecto](#estructura-del-proyecto)
8. [Referencia de la API](#referencia-de-la-api)
9. [Formato de errores](#formato-de-errores)
10. [Pruebas](#pruebas)
11. [Solución de problemas](#solución-de-problemas)
12. [Decisiones técnicas y limitaciones](#decisiones-técnicas-y-limitaciones)

## Descripción

La API permite consultar equipos, filtrarlos por modalidad y registrar nuevos. Los datos se guardan **en memoria**: al reiniciar el servidor vuelven a los datos iniciales.

Arquitectura en capas: `routes` → `controllers` → `services`.

## Requisitos

| Herramienta | Versión mínima | Verificar con |
| --- | --- | --- |
| Node.js | 20 | `node -v` |
| npm | 9 | `npm -v` |

## Instalación

```bash
git clone <url-del-repositorio>
cd ejercicio-29
npm install
```

## Ejecución

```bash
npm start          # producción simple
npm run dev        # desarrollo: reinicia al guardar cambios
```

Por defecto el servidor queda en `http://localhost:3000`. Comprobación rápida:

```bash
curl http://localhost:3000/health
# {"ok":true,"status":"up"}
```

## Scripts disponibles

| Script | Comando | Descripción |
| --- | --- | --- |
| `npm start` | `node src/server.js` | Inicia el servidor |
| `npm run dev` | `node --watch src/server.js` | Inicia con recarga automática |
| `npm test` | `node --test` | Ejecuta las pruebas automáticas |

## Variables de entorno

| Variable | Obligatoria | Por defecto | Descripción |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | Puerto en el que escucha el servidor |

Ejemplo: `PORT=4000 npm start` (Linux/macOS) o `$env:PORT=4000; npm start` (PowerShell).

## Estructura del proyecto

```text
ejercicio-29/
├── package.json
├── README.md
├── src/
│   ├── server.js                      # arranque (listen)
│   ├── app.js                         # configuración de Express y errores
│   ├── routes/index.js                # URL → controlador
│   ├── controllers/teams.controller.js# HTTP: req/res
│   └── services/teams.service.js      # reglas de negocio y datos
└── test/app.test.js
```

## Referencia de la API

URL base: `http://localhost:3000` · Formato: JSON · Los cuerpos de `POST` requieren `Content-Type: application/json`.

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-29` | Endpoint principal del ejercicio | 200 |
| GET | `/teams` | Lista de equipos | 200, 400 |
| GET | `/teams/:id` | Detalle de un equipo | 200, 400, 404 |
| POST | `/teams` | Crea un equipo | 201, 400, 409 |

### `GET /teams`

Parámetro de query opcional:

| Parámetro | Valores | Descripción |
| --- | --- | --- |
| `type` | `futbol`, `futbol-sala` | Filtra por modalidad |

```bash
curl "http://localhost:3000/teams?type=futbol-sala"
```

```json
{
  "ok": true,
  "total": 1,
  "teams": [
    { "id": 2, "name": "Rayos Sala", "type": "futbol-sala", "city": "Antigua", "founded": 2010 }
  ]
}
```

### `GET /teams/:id`

| Parámetro de ruta | Tipo | Descripción |
| --- | --- | --- |
| `id` | entero positivo | Identificador del equipo |

```bash
curl http://localhost:3000/teams/1
```

```json
{ "ok": true, "team": { "id": 1, "name": "Cobras FC", "type": "futbol", "city": "Guatemala", "founded": 1998 } }
```

### `POST /teams`

Cuerpo:

| Campo | Tipo | Regla |
| --- | --- | --- |
| `name` | texto | Al menos 2 caracteres; único (sin distinguir mayúsculas) |
| `type` | texto | `futbol` o `futbol-sala` |
| `city` | texto | Obligatorio |
| `founded` | entero | Año entre 1850 y el año actual |

```bash
curl -i -X POST http://localhost:3000/teams \
  -H "Content-Type: application/json" \
  -d '{"name":"Leones","type":"futbol","city":"Cobán","founded":2001}'
```

```text
HTTP/1.1 201 Created
Location: /teams/4
```

```json
{ "ok": true, "team": { "id": 4, "name": "Leones", "type": "futbol", "city": "Cobán", "founded": 2001 } }
```

## Formato de errores

Todos los errores usan `ok: false` y un `message`; los de validación añaden `details`.

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "details": ["name debe tener al menos 2 caracteres", "type debe ser uno de: futbol, futbol-sala"]
}
```

| Código | Cuándo |
| --- | --- |
| 400 | JSON mal formado, datos inválidos, `id` o `type` incorrectos |
| 404 | Equipo o ruta inexistente |
| 409 | Ya existe un equipo con ese nombre |
| 500 | Error inesperado (mensaje genérico; el detalle solo se registra en el servidor) |

## Pruebas

```bash
npm test
```

Cubren las rutas, filtros, validaciones y códigos de estado (se levanta la app en un puerto libre, no ocupa el 3000).

## Solución de problemas

| Síntoma | Causa probable | Solución |
| --- | --- | --- |
| `Error: listen EADDRINUSE: address already in use :::3000` | El puerto 3000 está ocupado | Usa otro: `PORT=4000 npm start`, o cierra el proceso que lo usa |
| `Cannot find module 'express'` | No se instalaron dependencias | Ejecuta `npm install` |
| `npm test` no encuentra pruebas | Node anterior a 18 | Actualiza a Node 20 o superior |
| `400` con `El cuerpo no es un JSON valido` | JSON mal formado o comillas incorrectas en la terminal | Revisa el JSON; en PowerShell usa comillas simples por fuera o un archivo con `-d @archivo.json` |
| Los equipos creados desaparecen | Datos en memoria | Es esperado; al reiniciar vuelven los datos iniciales |

## Decisiones técnicas y limitaciones

- **Datos en memoria:** simplifica el ejercicio; no apto para producción. El siguiente paso natural sería una base de datos.
- **Sin autenticación:** cualquiera puede crear equipos.
- **Sin paginación:** `GET /teams` devuelve todo.
- Los ids se generan como `máximo + 1`; sin base de datos no hay concurrencia real que cuidar.

## Autor

Daniel Aguilar — Bootcamp de Ingeniería de Software, CampusLands.
