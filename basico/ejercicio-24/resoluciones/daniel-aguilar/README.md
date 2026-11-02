# Ejercicio 24 — CRUD básico

**Temática:** fórmulas químicas · **Nivel:** Básico guiado

## Objetivo

Implementar las cuatro operaciones fundamentales sobre un recurso — **C**reate, **R**ead, **U**pdate y **D**elete — usando el verbo HTTP y el código de estado correctos en cada una.

## Requisitos

- Node.js 20 o superior

## Instalación y ejecución

```bash
npm install
npm start
npm run dev
npm test
```

Servidor en `http://localhost:3000` (configurable con `PORT`). Los datos están en memoria y se pierden al reiniciar.

## Estructura

```text
ejercicio-24/
├── package.json
├── README.md
├── src/
│   ├── app.js
│   ├── server.js
│   ├── routes/index.js
│   ├── controllers/compounds.controller.js
│   ├── services/compounds.service.js     # validación y reglas
│   └── store/compounds.store.js          # datos en memoria
└── test/app.test.js
```

## Operaciones CRUD

| Operación | Método | Ruta | Éxito | Errores |
| --- | --- | --- | --- | --- |
| Create | POST | `/compounds` | `201` + `Location` | 400, 409 |
| Read (lista) | GET | `/compounds?category=organico` | `200` | 400 |
| Read (uno) | GET | `/compounds/:id` | `200` | 400, 404 |
| Update | PUT | `/compounds/:id` | `200` | 400, 404, 409 |
| Delete | DELETE | `/compounds/:id` | `204` sin cuerpo | 400, 404 |

Además: `GET /health` y `GET /basico/ejercicio-24` (endpoint principal).

### Modelo

| Campo | Regla |
| --- | --- |
| `name` | Texto de al menos 2 caracteres |
| `formula` | Fórmula simple como `H2O`, `NaCl`, `C6H12O6` (sin paréntesis); **única** |
| `molarMass` | Número mayor a 0 (g/mol) |
| `category` | `organico` o `inorganico` |

## Ejemplos

```bash
# Create
curl -i -X POST http://localhost:3000/compounds \
  -H "Content-Type: application/json" \
  -d '{"name":"Etanol","formula":"C2H6O","molarMass":46.07,"category":"organico"}'

# Read
curl http://localhost:3000/compounds
curl "http://localhost:3000/compounds?category=organico"
curl http://localhost:3000/compounds/4

# Update (PUT: se envían TODOS los campos)
curl -X PUT http://localhost:3000/compounds/4 \
  -H "Content-Type: application/json" \
  -d '{"name":"Alcohol etilico","formula":"C2H6O","molarMass":46.07,"category":"organico"}'

# Delete
curl -i -X DELETE http://localhost:3000/compounds/4     # 204 No Content
curl -i http://localhost:3000/compounds/4               # 404
```

## Decisiones

- `PUT` **reemplaza** el recurso completo, por eso se exigen todos los campos; una actualización parcial usaría `PATCH` (fuera del alcance de este ejercicio).
- `DELETE` exitoso responde `204` sin cuerpo; borrar algo inexistente responde `404`.
- Una fórmula repetida responde `409 Conflict`; al actualizar, el propio recurso no cuenta como duplicado.
- El servicio lanza errores con `status`; el middleware de `app.js` los convierte en la respuesta JSON.

## Pruebas

```bash
npm test
```
