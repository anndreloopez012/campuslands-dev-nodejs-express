# INTERMEDIO 30 - Proyecto integrador intermedio

## Objetivo

Combinar en una sola API de taller de motos TODAS las piezas aprendidas en la serie intermedia: arquitectura por capas, routers modulares, patron repositorio con secuencias estables, errores de dominio centralizados, integridad referencial, transiciones de estado controladas, control de stock y codigos HTTP coherentes.

## Mapa de conceptos aplicados

| Concepto (source)            | Donde vive aqui                            |
| ---------------------------- | ------------------------------------------ |
| Arquitectura por capas (01)  | routes / controllers / services / repositories |
| Routers modulares (02)       | tres dominios en `taller.routes.js`        |
| Controladores limpios (03)   | `taller.controller.js`: solo HTTP mapping  |
| Repositorio en memoria (05)  | `TallerRepository` con sequencias de id    |
| Errores tipados (07)         | `errors/app.error.js` + error handler      |
| Relaciones simples (13)      | ordenes referencian `motoId` y `repuestoId`|
| Transiciones de estado       | ordenes: `abierta -> en_proceso -> cerrada`|
| Control de stock             | repuestos: entradas/salidas con corte en 0 |

Reglas de negocio destacadas:

1. **Placas unicas** con formato `AAA-999` y normalizacion a mayusculas (409 si se repite).
2. **Ordenes con costo real**: mano de obra (`horas * 18`) + repuesto consumido. Si no hay stock, 409 y no se guarda la orden.
3. **Transiciones de estado sin saltos**: intentar pasar de `abierta` a `cerrada` devuelve 409 con la transicion valida.
4. **Movimientos de inventario auditable**: cada entrada/salida exige motivo y lo devuelve.

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
    ├── repositories/
    │   └── taller.repository.js
    ├── routes/
    │   └── taller.routes.js
    ├── controllers/
    │   └── taller.controller.js
    └── services/
        └── taller.service.js        (negocio del taller completo)
```

## Como ejecutar

```bash
npm install
npm run start
```

## Recorrido de verificacion (flujo de trabajo completo)

```bash
# 1. Inventario inicial
curl http://localhost:3000/repuestos

# 2. Registrar una moto -> 201 (placa normalizada a mayusculas)
curl -X POST http://localhost:3000/motos \
  -H "Content-Type: application/json" \
  -d '{"placa": "def-456", "marca": "Urbana", "modelo": "Scoo Transit", "cilindrada": 125, "dueño": "Nico Rues"}'

# Caso: placa duplicada -> 409
curl -X POST http://localhost:3000/motos -H "Content-Type: application/json" \
  -d '{"placa": "ABC-123", "marca": "Krantz", "modelo": "Otra 200", "cilindrada": 200, "dueño": "Duplica"}'

# 3. Abrir orden con repuesto ft-01 (id 1, hay stock) -> 201 con totales
curl -X POST http://localhost:3000/ordenes \
  -H "Content-Type: application/json" \
  -d '{"motoId": 3, "descripcion": "Tune-up 4000 km con ajuste de valvulas", "repuestoId": 1, "horas": 1.5}'

# Caso: repuesto sin stock (id 2, stock 0) -> 409 CONFLICTO
curl -X POST http://localhost:3000/ordenes -H "Content-Type: application/json" \
  -d '{"motoId": 3, "descripcion": "Cambio de cadena desgastada", "repuestoId": 2, "horas": 1}'

# 4. Flujo de estados: abierta -> en_proceso -> cerrada; salto directo -> 409
curl -X POST http://localhost:3000/ordenes/1/estado -H "Content-Type: application/json" -d '{"estado": "en_proceso"}'
curl -X POST http://localhost:3000/ordenes/1/estado -H "Content-Type: application/json" -d '{"estado": "cerrada"}'
curl -X POST http://localhost:3000/ordenes/1/estado -H "Content-Type: application/json" -d '{"estado": "en_proceso"}'

# 5. Repone stock del CV-30 con motivo -> 200
curl -X POST http://localhost:3000/repuestos/2/stock \
  -H "Content-Type: application/json" \
  -d '{"operacion": "entrada", "cantidad": 5, "motivo": "Compra a proveedor Nordexpress"}'

# 6. La orden 2 con el repuesto repone: ahora si funciona
curl -X POST http://localhost:3000/ordenes -H "Content-Type: application/json" \
  -d '{"motoId": 2, "descripcion": "Cambio de cadena desgastada", "repuestoId": 2, "horas": 1}'
```

## Punto clave

Un proyecto integrador no agrega features nuevas: **conecta** piezas ya aprendidas. El flujo del stock resuelve la orden sin tocar la orden, la transicion de estados se valida sin tocar el repositorio — esa es la senal de una arquitectura sana.
