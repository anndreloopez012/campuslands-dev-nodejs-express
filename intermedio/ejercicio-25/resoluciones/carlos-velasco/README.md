# INTERMEDIO 25 - Testing de rutas (integracion con app real)

## Objetivo

Crear una API Node.js cuyas rutas HTTP se testeen con el runner nativo `node:test`: la app se exporta sin `listen`, los tests la levantan en un puerto efimero (indicado por el OS con `listen(0)`) y dispara `fetch` contra el pipeline completo.

## Concepto principal

Los tests de servicio (23 y 24) prueban funciones puras; los tests de rutas prueban el **contrato HTTP completo**:

1. `src/app.js` construye la app y la exporta; NO hace `listen`.
2. `src/server.js` es el punto de entrada que escucha en el puerto 3000.
3. El test hace `app.listen(0)` (puerto efimero elegido por el OS, permite ejecutar tests en paralelo sin colisiones) y usa `fetch` nativo.

Con esto se prueba exactamente lo que el cliente vera: codigos de estado, cuerpo JSON, 404 de rutas inexistentes, 400 de validacion y 404 de integridad referencial.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json              (script "test": node --test src/tests/)
├── README.md
└── src/
    ├── app.js          (app exportable, sin listen)
    ├── server.js       (levanta en el puerto 3000)
    ├── routes/
    │   └── quests.routes.js
    ├── controllers/
    │   └── quest.controller.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── services/
    │   └── quest.service.js
    └── tests/
        └── quests.routes.test.js
```

## Como ejecutar

```bash
npm install
npm test          # suites de rutas contra app real
npm run start     # produccion (server.js escucha en 3000)
```

## Tests incluidos (10)

| Suite                   | Caso                                            | Esperado |
| ----------------------- | ----------------------------------------------- | -------- |
| rutas publicas          | GET /health con topic                           | 200      |
| rutas publicas          | GET /heroes lista                               | 200      |
| rutas publicas          | GET /heroes/999                                 | 404 NotFoundError |
| rutas publicas          | GET /gremios (ruta inexistente)                 | 404 ok:false |
| POST /misiones          | crear mision valida                             | 201      |
| POST /misiones          |titulo corto                                     | 400 ValidationError |
| POST /misiones          | mision con heroeId inexistente                  | 404 NotFoundError |
| POST /misiones/:id/asignar | asignar heroe libre                          | 200 |
| POST /misiones/:id/asignar | reasignar mision ya tomada                     | 400      |

Con `before`/`after` del runner: `before` levanta el servidor solo una vez para toda la suite y `after` ejecuta `server.close()` para liberar el puerto.

## Sobre supertest

Existe el paquete `supertest` para probar apps Express sin abrir sockets. Aqui no se uso: `fetch` nativo + `listen(0)` no agrega dependencias y prueba el socket de verdad.

## Ejemplos de peticiones de la API real (curl)

```bash
# Lista de misiones con heroe embebido
curl http://localhost:3000/misiones

# Crear mision
curl -X POST http://localhost:3000/misiones \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Defender la Fragata", "dificultad": "media", "recompensa_oro": 220}'

# Caso de error de validacion -> 400
curl -X POST http://localhost:3000/misiones \
  -H "Content-Type: application/json" \
  -d '{"titulo": "Pro", "dificultad": "media", "recompensa_oro": -4}'

# Asignar mision
curl -X POST http://localhost:3000/misiones/3/asignar \
  -H "Content-Type: application/json" \
  -d '{"heroeId": 2}'
```

## Punto clave

La misma logica puede funcionar en el servicio y fallar en la ruta: el `heroeId` puede llegar como string ("5") arreglado desde JSON, la ruta puede parsear mal el id, etc. Los tests de rutas atrapan ese tipo de regresiones, porque el HTTP no es un detalle menor.
