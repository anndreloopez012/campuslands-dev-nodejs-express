# INTERMEDIO 26 - Mock de dependencias

## Objetivo

Crear una API Node.js con Express cuyo servicio dependa de un repositorio **inyectado**, de forma que los tests reemplacen la dependencia por un mock sin tocar codigo de produccion ni abrir storage real.

## Concepto principal

El mock solo funciona si la dependencia es sustituible. Dos requisitos de diseno:

1. **Inyeccion de dependencia**: `new MatchService({ mapRepository })` en lugar de `require('./mapRepository')` dentro del servicio. El require duro hace imposible el mock sin librerias que reescriban el cache de modulos.
2. **Contrato estable**: el mock implementa LA MISMA interfaz del real (`findById/all/save`). Ningun otro codigo cambia.

Ademas el runner `node:test` trae la utilidad `mock.fn()`: crea una funcion falsa que registra llamadas (`callCount`, `calls[0].arguments`) para verificar como el servicio consulto la dependencia.

El orden de validacion importa y se prueba: formato (titulo/modo) se valida ANTES de consultar al mock; si un dato es invalido, la dependencia ni siquiera se toca.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json              (script "test": node --test src/tests/)
├── README.md
└── src/
    ├── app.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── routes/
    │   └── matches.routes.js
    ├── controllers/
    │   └── matches.controller.js  (inyecta el repo REAL)
    ├── repositories/
    │   └── maps.repository.js     (la dependencia sustituible)
    ├── services/
    │   └── matches.service.js     (servicio con inyeccion)
    └── tests/
        └── matches.service.test.js (mock manual + mock.fn)
```

## Como ejecutar

```bash
npm install
npm test          # 5 tests con mocks, 0 storage real
npm run start
```

## Tests incluidos (5 pass)

| Caso |
| ---- |
| listar mapas delega en el mock (verifica conteo de llamadas) |
| crearPartida valida el mapa contra el mock |
| ValidationError si el mock no conoce el mapa |
| el formato invalido falla ANTES de tocar la dependencia |
| mock.fn del runner verifica argumentos de las llamadas |

## API real (inyecta el repositorio verdadero)

```bash
# Mapas reales del repositorio
curl http://localhost:3000/maps

# Programar partida -> 201
curl -X POST http://localhost:3000/matches \
  -H "Content-Type: application/json" \
  -d '{"mapId": 3, "titulo": "Final Torneo", "modo": "snd"}'

# Caso de error: modo invalido (no toca el repositorio) -> 400
curl -X POST http://localhost:3000/matches \
  -H "Content-Type: application/json" \
  -d '{"mapId": 3, "titulo": "Partida Misteriosa", "modo": "laser"}'

# Caso de error: mapa inexistente -> 400 desde el servicio
curl -X POST http://localhost:3000/matches \
  -H "Content-Type: application/json" \
  -d '{"mapId": 99, "titulo": "Partida Fantasma", "modo": "dm"}'
```

## Punto clave

Mockear SIN inyeccion obliga a hackear el modulo (`mock.module` experimental, reescribir el cache). Con inyeccion el mock es una funcion de test de 10 lineas y la logica de produccion no cambia.
