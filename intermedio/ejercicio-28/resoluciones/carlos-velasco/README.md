# INTERMEDIO 28 - Coleccion de ejemplos HTTP

## Objetivo

Crear una API Node.js con Express que sea una **galeria de ejemplos HTTP** tematizada en un dominio battle royale: cada metodo (GET/POST/PUT/PATCH/DELETE/HEAD/OPTIONS) y cada codigo relevante (200, 201, 202, 204, 400, 401, 403, 404, 409, 415, 429) tiene una ruta dedicada que lo demuestra.

## Concepto principal

La galeria vive en `src/http/catalogo.js`: un listado declarativo de 16 ejemplos (metodo, ruta, codigo esperado y explicacion) que la API expone en `/ejemplos` e implementa exactamente igual en el router.

Lecciones practicas que puedas verificar con curl:

| Demostracion | Por que importa |
| ------------ | --------------- |
| `201` + header `Location` | al crear, el cliente sabe DONDE quedo el recurso |
| `202` | peticiones encoladas: aceptada no es completada |
| `204` | exito SIN cuerpo: DELETE nunca envia body |
| `200` con lista vacia | "sin resultados" NO es 404 |
| `401` vs `403` | no autenticado (401) no es sin permiso (403) |
| `409` | conflicto con el estado actual (registro duplicado) |
| `415` | media type no soportado |
| `429` | cuota agotada (demo con contador) |
| `HEAD` | headers de /ping sin body |

Correcto PUT vs PATCH: PUT invalida si faltan campos (reemplazo completo), PATCH solo exige el campo parcial.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── http/
    │   └── catalogo.js         (declaracion de los 16 ejemplos)
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    └── routes/
        └── galeria.routes.js   (implementa el catalogo)
```

## Como ejecutar

```bash
npm install
npm run start
```

## El tour (copiando cada bloque)

```bash
# 1. Catalogo de la coleccion
curl http://localhost:3000/ejemplos

# 2. 201 + Location
curl -i -X POST http://localhost:3000/loot \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Granada Frag"}' | grep -ei location -ei "^HTTP"

# 3. 415 media type equivocado
curl -i -X POST http://localhost:3000/loot \
  -H "Content-Type: text/plain" \
  --data "granada" | head -1

# 4. 202 aceptado en cola
curl -X POST http://localhost:3000/torneo/inscripcion -d '{"squad": "SquadX"}'

# 5. 409 conflicto (segunda vez)
curl -X POST http://localhost:3000/torneo/registro -H "Content-Type: application/json" -d '{"squad_id": "SquadY"}'
curl -X POST http://localhost:3000/torneo/registro -H "Content-Type: application/json" -d '{"squad_id": "SquadY"}'

# 6. PUT exige todo; PATCH solo un campo
curl -X PUT http://localhost:3000/inventario/1 -H "Content-Type: application/json" -d '{"nombre": "Escudo Tactico", "cantidad": 4}'
curl -X PATCH http://localhost:3000/inventario/1 -H "Content-Type: application/json" -d '{"cantidad": 5}'

# 7. 204 sin cuerpo (DELETE del item 1 tras el PATCH)
curl -i -X DELETE http://localhost:3000/inventario/1 | head -1

# 8. 401 -> 403 con el token correcto
curl http://localhost:3000/sala-vip
curl -H "Authorization: Bearer escuadrilla-2026" http://localhost:3000/sala-vip
curl -H "Authorization: Bearer escuadrilla-2026" -H "x-rol: campeon" http://localhost:3000/sala-vip

# 9. 404 de recurso inexistente y 200 con lista vacia
curl http://localhost:3000/area/99
curl http://localhost:3000/caja-vacia

# 10. 429: tercera consulta a la torre
curl http://localhost:3000/torre; curl http://localhost:3000/torre; curl -i http://localhost:3000/torre | head -1

# 11. HEAD sin body
curl -i -I http://localhost:3000/ping
```

## Punto clave

Los codigos HTTP son un lenguaje de contratos: elegir mal es comunicar mal. Esta coleccion sirve de cheat sheet para las decisiones de status de cualquier API futura.
