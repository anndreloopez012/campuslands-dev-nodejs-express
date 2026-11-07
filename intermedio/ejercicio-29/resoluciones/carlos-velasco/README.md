# INTERMEDIO 29 - Refactor de API

## Objetivo

Refactorizar una API de futbol que nacio como monolito y llevarla a su version por capas, corrigiendo 5 antipatrones concretos, sin cambiar el contrato visible del cliente y documentando el "antes"/"despues".

## El "antes": antipatrones del legacy

El archivo `src/legacy/app.legacy.js` guarda el esquema del monolito con sus defectos numerados:

| # | Antipatron | Refactor aplicado |
| - | ---------- | ----------------- |
| 1 | Todo en un archivo (ruta + validacion + negocio + datos) | division en `routes/controllers/services/repositories` |
| 2 | Validacion duplicada en cada ruta | validacion UNICA dentro del service (`reglasEquipo`) |
| 3 | Errores respondidos con 200 y "no encontrado" con 500 | errores de dominio tipados: 400/404/409 + middleware de errores |
| 4 | IDs asignados con array.length (colisionan al borrar) | secuencia monotonic (`nextId`) en el repositorio |
| 5 | try/catch repetido con respuestas improvisadas | try/catch unificado en el controller + next(error) |

Regla del refactor: **el contrato externo no se rompe**. Mismas rutas, misma forma `{ ok, message, data }`, misma semantica de codigos (corregida donde estaba mal).

## El "despues": estructura

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── legacy/
    │   └── app.legacy.js          (referencia del antes, no se ejecuta)
    ├── errors/
    │   └── app.error.js           (400/404/409 tipados)
    ├── middlewares/
    │   └── error.handler.js       (unica puerta de errores)
    ├── repositories/
    │   └── futbol.repository.js   (datos: all/find/save/remove + secuencias)
    ├── routes/
    │   └── football.routes.js     (solo declaracion de rutas)
    ├── controllers/
    │   └── football.controller.js (solo HTTP mapping)
    └── services/
        └── football.service.js    (reglas: unicidad, plantilla, cascada)
```

## Beneficios medibles del refactor

- **Un solo lugar para validar**: agregar la regla "ciudad obligatoria" toca `football.service.js` y ninguna ruta.
- **Ids estables**: borrar el equipo 1 ya no provoca que el proximo cree otro id 1.
- **Codigos HTTP honestos**: `404` para equipo inexistente, `409` para nombre duplicado, `201` para creaciones (con `Location`).
- **Borrado en cascada controlado**: `DELETE /equipos/:id` libera los jugadores y reporta cuantos libero (antes no existia la regla).

## Como ejecutar

```bash
npm install
npm run start
```

## Contrato de la API refactorizada

| Metodo | Ruta | Codigo | Nota |
| ------ | ---- | ------ | ---- |
| GET | /equipos | 200 | query `ciudad=` filtro case-insensitive |
| POST | /equipos | 201 + Location | 400 validacion, 409 duplicado |
| GET | /equipos/:id/plantilla | 200 | equipo + plantilla embebida |
| POST | /equipos/:id/jugadores | 201 | 404 si el equipo no existe |
| DELETE | /equipos/:id | 200 | reporta jugadores_liberados |

## Ejemplos de peticiones

```bash
# Antes: "no encontrado" respondia 500; Ahora: 404 coherente
curl -i http://localhost:3000/equipos/99/plantilla

# Antes: duplicado no existia; Ahora: 409
curl -X POST http://localhost:3000/equipos \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Estrellas del Norte", "ciudad": "Quito"}'

# Fichaje
curl -X POST http://localhost:3000/equipos/2/jugadores \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Dario Frente", "posicion": "mediocampista"}'

# Caso de error: posicion invalida -> 400 (una sola validacion, en el service)
curl -X POST http://localhost:3000/equipos/2/jugadores \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Alguien", "posicion": "portero"}'

# Disolver equipo: liberation de plantilla
curl -X DELETE http://localhost:3000/equipos/2
```

## Punto clave

Refactorar sin medida de seguridad es adivinar: por eso al "antes" se lo congela como contrato (mismas rutas y forma de respuesta) y la nueva arquitectura solo cambia el "como", no el "que".
