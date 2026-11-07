# INTERMEDIO 06 - Validacion centralizada

## Objetivo

Crear una API Node.js con Express donde toda la validacion de entrada se ejecute en un unico lugar: middlewares de validacion por schema, reutilizables en cualquier ruta.

## Concepto principal

En lugar de validar dentro de cada controlador, los schemas declaran reglas y un middleware las aplica:

```js
router.post('/motos', validar(motorSchema), tallerController.crearMoto);
```

- `reglas.js` contiene reglas genericas (`requerido`, `texto(min,max)`, `entero(min,max)`, `numero(min)`, `enum([...])`).
- `schema.validator.js` recorre el schema campo por campo, junta **todos** los errores y entrega un unico problema de entrada (`ValidationError`, 400) al middleware de errores.
- Los controladores y servicios ya no validan formato: solo manejan negociación y reglas de negocio.
- Si un id referencias otra coleccion (`motoId` de una orden), el servicio valida la existencia, no el formato.

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
    │   └── taller.routes.js
    ├── validators/
    │   ├── reglas.js
    │   ├── schema.validator.js
    │   └── moto.schemas.js
    ├── controllers/
    │   └── taller.controller.js
    └── services/
        └── taller.service.js
```

## Como ejecutar

```bash
npm install
npm run start   # produccion
npm run dev     # desarrollo con recarga automatica
```

## Endpoints

| Metodo | Ruta | Validacion aplicada | Codigo |
| ------ | ---- | ------------------- | ------ |
| GET | /health | ninguna | 200 |
| GET | /motos | ninguna (consulta) | 200 |
| GET | /motos/:id | existencia en servicio | 200 / 404 |
| POST | /motos | `motorSchema` | 201 / 400 |
| GET | /ordenes | existencia cruzada | 200 |
| POST | /ordenes | `ordenSchema` | 201 / 400 / 404 |

## Ejemplos de peticiones

```bash
# Crear moto con schema completo
curl -X POST http://localhost:3000/motos \
  -H "Content-Type: application/json" \
  -d '{"modelo": "Rodante X", "marca": "Andes", "cilindrada": 150, "tipo": "trail", "precio": 5400}'

# Caso de error:
# "cilindrada" 3000 (fuera de rango) y tipos invalido -> ambos errores juntos en un 400
curl -X POST http://localhost:3000/motos \
  -H "Content-Type: application/json" \
  -d '{"modelo": "Bo", "marca": "Andes", "cilindrada": 3000, "tipo": "offroad", "precio": -1}'

# Crear orden sobre una moto existente
curl -X POST http://localhost:3000/ordenes \
  -H "Content-Type: application/json" \
  -d '{"motoId": 1, "descripcion": "Cambio de pastillas de freno delanteras", "horas": 1.5}'

# Caso de error de negocio -> moto que no existe (404 desde el servicio)
curl -X POST http://localhost:3000/ordenes \
  -H "Content-Type: application/json" \
  -d '{"motoId": 99, "descripcion": "Revision general 10000 km", "horas": 2}'
```

## Punto clave

Un schema es declarativo: quien lea la ruta sabe exactamente que contrato necesita el endpoint sin abrir el controlador. Agregar validacion para un endpoint nuevo es solo escribir otro archivo de schema.
