# INTERMEDIO 04 - Servicios reutilizables

## Objetivo

Crear una API Node.js con Express donde dos dominios distinto (`armas` y `escuadras`) compartan la misma base de codigo de negocio mediante una fabrica de CRUD y una fabrica de controladores.

## Concepto principal

Cuando dos servicios repiten la misma logica de listar/obtener/crear/actualizar/eliminar, el codigo se factoriaza:

- `base.crud.js` expone `crearCrudReutilizable({ recurso, items, validar })`: construye un CRUD completo en memoria validando con la funcion que se le inyecta.
- `base.controller.js` expone `crearControladores({ servicio, recurso })`: construye los cinco handlers HTTP a partir de cualquier servicio con esa interfaz.

El resultado: cada dominio solo escribe **su funcion de validacion y su archivo de datos**, y hereda todo el resto. Cambiar el CRUD central cambia automaticamente ambos dominios.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── errors/
    │   └── app.error.js
    ├── middlewares/
    │   └── error.handler.js
    ├── routes/
    │   └── index.routes.js
    ├── controllers/
    │   └── base.controller.js
    └── services/
        ├── base.crud.js
        ├── armas.service.js
        └── escuadras.service.js
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
| GET/POST | /armas | Lista / crea armas | 200 / 201 |
| GET/PATCH/DELETE | /armas/:id | Detalle / actualizacion parcial / borrado | 200 |
| GET/POST | /escuadras | Lista / crea escuadras | 200 / 201 |
| GET/PUT/DELETE | /escuadras/:id | Detalle / actualizacion / borrado | 200 |
| (todas) | errores | Respuesta `{ ok, error, message }` | 400 / 404 / 500 |

## Ejemplos de peticiones

```bash
# Listar armas (CRUD heredado)
curl http://localhost:3000/armas

# Crear arma
curl -X POST http://localhost:3000/armas \
  -H "Content-Type: application/json" \
  -d '{"name": "Centell", "tipo": "asalto", "danio": 41, "rareza": "rara"}'

# Caso de error -> 400 { error: "ValidationError" }
curl -X POST http://localhost:3000/armas \
  -H "Content-Type: application/json" \
  -d '{"name": "Bo", "tipo": "laser", "danio": 41, "rareza": "rara"}'

# Actualizacion parcial de un arma
curl -X PATCH http://localhost:3000/armas/1 \
  -H "Content-Type: application/json" \
  -d '{"danio": 27}'

# Crear escuadra (valida que la primaria exista consultando el otro servicio)
curl -X POST http://localhost:3000/escuadras \
  -H "Content-Type: application/json" \
  -d '{"name": "Corona Verde", "servidor": "EU", "primariaId": 3}'

# Caso de error -> arma inexistente (400)
curl -X POST http://localhost:3000/escuadras \
  -H "Content-Type: application/json" \
  -d '{"name": "Sombras", "servidor": "EU", "primariaId": 999}'
```

## Punto clave

Los servicios validados pasan por la misma fabrica, pero cada uno conserva su propia validacion inyectada. El dominio `escuadras` incluso valida contra `armas`, con acoplamiento de solo lectura.
