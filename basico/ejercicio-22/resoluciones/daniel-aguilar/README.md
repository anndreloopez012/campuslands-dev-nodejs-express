# Ejercicio 22 — Servicios simples

**Temática:** arquitectura 3D · **Nivel:** Básico guiado

## Objetivo

Separar la **lógica de negocio** (reglas, cálculos, validaciones) en una capa de **servicios** que no sabe nada de HTTP. El controlador queda como un traductor delgado entre la petición y el servicio.

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
ejercicio-22/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/index.js
│   ├── controllers/projects.controller.js   # HTTP: req -> servicio -> res
│   └── services/projects.service.js         # negocio: reglas y cálculos
└── test/app.test.js
```

| Capa | Responsabilidad | NO debe |
| --- | --- | --- |
| Ruta | Asociar URL + método con un controlador | Tener lógica |
| Controlador | Leer `req`, llamar al servicio, responder con `res` | Calcular o validar reglas de negocio |
| Servicio | Reglas, validaciones de dominio y cálculos | Usar `req`, `res` ni códigos de respuesta HTTP directos |

El servicio indica el tipo de error con un `status` en el error lanzado; el middleware de errores de `app.js` lo convierte en la respuesta.

## Regla de negocio: estimación de render

```text
minutos = ceil( (polígonos / 100.000) × multiplicador(calidad) × (1 + luces × 0.1) )
```

| Calidad | Multiplicador |
| --- | --- |
| `draft` | 0.5 |
| `standard` (por defecto) | 1 |
| `high` | 2.5 |

Ejemplo: Casa Los Cedros (240.000 polígonos, 6 luces) en calidad `high` → 2.4 × 2.5 × 1.6 = 9.6 → **10 minutos**.

## Endpoints

| Método | Ruta | Descripción | Códigos |
| --- | --- | --- | --- |
| GET | `/health` | Estado del servicio | 200 |
| GET | `/basico/ejercicio-22` | Endpoint principal | 200 |
| GET | `/projects` | Lista de proyectos | 200 |
| GET | `/projects/:id` | Detalle | 200, 400, 404 |
| GET | `/projects/:id/render-estimate?quality=high` | Estimación de render | 200, 400, 404 |
| GET | `/summary` | Totales y conteo por tipo | 200 |
| POST | `/projects` | Crea un proyecto | 201, 400 |

## Ejemplos

```bash
curl http://localhost:3000/projects/1
curl "http://localhost:3000/projects/1/render-estimate?quality=high"
curl http://localhost:3000/summary

curl -i -X POST http://localhost:3000/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"Museo Norte","type":"comercial","polygons":800000,"lights":12}'
```

```json
{
  "ok": true,
  "estimate": { "projectId": 1, "quality": "high", "minutes": 10, "hours": 0.17 }
}
```

## Ventaja: se prueba sin HTTP

Como el servicio no depende de `req`/`res`, `estimateRender` se prueba llamándola directamente (ver `test/app.test.js`), sin levantar el servidor.

## Pruebas

```bash
npm test
```
