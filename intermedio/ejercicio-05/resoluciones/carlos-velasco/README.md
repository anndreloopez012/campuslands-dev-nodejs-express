# INTERMEDIO 05 - Repositorios en memoria

## Objetivo

Crear una API Node.js con Express que separe el acceso a datos del negocio mediante el patron Repository, usando una coleccion en memoria como almacen.

## Concepto principal

El repositorio es la unica pieza que sabe **donde** estan los datos; el servicio solo sabe **que** hacer con ellos:

| Capa | Pregunta que responde |
| ---- | --------------------- |
| Repository | ¿Como busco y guardo registros? |
| Service | ¿Que validaciones y reglas aplico? |
| Controller | ¿ tradique codigo HTTP devuelvo? |

Esto es crucial porque el dia que los datos vivan en MySQL o Mongo, el repositorio cambia de implementacion y **el servicio no se toca**. Aqui ademas el repositorio implementa `findAll` con filtro/orden y una operacion `save` tipo upsert.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── data/
    │   └── equipos.repository.js   (instancia del repositorio con seed)
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── repositories/
    │   └── equipo.repository.js    (clase genérica)
    ├── routes/
    │   └── equipos.routes.js
    ├── controllers/
    │   └── equipos.controller.js
    └── services/
        └── equipos.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Endpoints

| Metodo | Ruta | Descripcion | Codigo |
| ------ | ---- | ----------- | ------ |
| GET | /health | Verifica el estado del servidor | 200 |
| GET | /equipos | Lista equipos (admite filtro y orden) | 200 |
| GET | /equipos/:id | Obtiene un equipo | 200 |
| POST | /equipos | Crea un equipo | 201 |
| PUT | /equipos/:id | Actualiza un equipo | 200 |
| DELETE | /equipos/:id | Elimina un equipo | 200 |

## Ejemplos de peticiones

```bash
# Lista completa
curl http://localhost:3000/equipos

# Filtro textual (por nombre o ciudad) y orden por titulos
curl "http://localhost:3000/equipos?filtro=norte&orden=desc"

# Crear equipo de futsal
curl -X POST http://localhost:3000/equipos \
  -H "Content-Type: application/json" \
  -d '{"name": "Agujas Futsal", "ciudad": "Lima", "tipo": "futsal", "titulos": 2}'

# Caso de error -> enviar id en POST se rechaza (400)
curl -X POST http://localhost:3000/equipos \
  -H "Content-Type: application/json" \
  -d '{"id": 50, "name": "Cheque", "ciudad": "Lima", "tipo": "futsal", "titulos": 0}'

# Actualizar titulos de un equipo existente
curl -X PUT http://localhost:3000/equipos/2 \
  -H "Content-Type: application/json" \
  -d '{"titulos": 7}'
```

## Contrato del repositorio

```text
findAll({ filtro, orden })  -> array
findById(id)                -> registro | null
save(registro)              -> registro creado o actualizado
remove(id)                  -> boolean
```

El id final lo asigna el repositorio con `nextId()` (maximo + 1), nunca el cliente. Asi el servicio solo orquesta reglas y el repositorio garantiza la integridad del almacen.
