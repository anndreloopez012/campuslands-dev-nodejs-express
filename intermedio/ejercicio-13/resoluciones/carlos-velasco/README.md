# INTERMEDIO 13 - Relaciones simples

## Objetivo

Crear una API Node.js con Express que maneje relaciones entre dos colecciones independientes (`naveId` en `misiones`) manteniendo integridad referencial en memoria.

## Concepto principal

A diferencia del subrecurso REST (`/padre/:id/hijo`), aqui las colecciones son hermanas y la relacion vive **dentro de los datos**:

- `misiones` referencia `naveId`; el servicio no permite crear misiones con naveId de nave inexistente.
- `naveId: null` es un caso valido y frecuente: mision planificada sin nave asignada.
- `asignarMision` permite reasignar después; falla si la nave no existe o si la mision ya finalizo ("completada"/"abortada").
- Al eliminar una nave **no se borran** sus misiones: quedan "huerfanas" con `naveId = null` y la respuesta informa cuantas quedaron. Es la alternativa sin base de datos real a los borrados en cascada.

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
    │   ├── ships.controller.js
    │   └── missions.controller.js
    └── services/
        └── fleet.service.js
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
| GET/POST | /ships | Lista (con conteo de misiones) / crea naves | 201 |
| DELETE | /ships/:id | Elimina nave, huerfana sus misiones | 200 |
| GET/POST | /missions | Lista (con nave embebida) / crea misiones | 201 |
| POST | /missions/:id/asignar-nave | Reasignar nave a una mision | 200 |

## Ejemplos de peticiones

```bash
# Lista naves con conteo de misiones asignadas
curl http://localhost:3000/ships

# Crear nave de carga
curl -X POST http://localhost:3000/ships \
  -H "Content-Type: application/json" \
  -d '{"nombre": "Faro Lento", "clase": "carga", "tripulacion": 12}'

# Crear mision SIN nave (naveId valida null)
curl -X POST http://localhost:3000/missions \
  -H "Content-Type: application/json" \
  -d '{"naveId": null, "destino": "Anillo Mor", "estado": "planificada"}'

# Caso de error: nave inexistente -> 404 (integridad referencial)
curl -X POST http://localhost:3000/missions \
  -H "Content-Type: application/json" \
  -d '{"naveId": 99, "destino": "Nada", "estado": "planificada"}'

# Asignar nave 2 a la mision 1
curl -X POST http://localhost:3000/missions/1/asignar-nave \
  -H "Content-Type: application/json" \
  -d '{"naveId": 2}'

# Eliminar la nave 1: sus misiones quedan con naveId null
curl -X DELETE http://localhost:3000/ships/1
```

## Punto clave

Guardar la relacion como id (`naveId`) y no como objeto copiado evita datos desactualizados: el GET de misiones centraliza el "join" en memoria, y el día que exista base de datos real es un $lookup / JOIN.
