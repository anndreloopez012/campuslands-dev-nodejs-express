# INTERMEDIO 24 - Testing de servicios

## Objetivo

Crear una API Node.js con Express cuyo nucleo de calculo quimico este **100% cubierto por tests de servicio** con el runner nativo `node:test`: los tests no pasan por HTTP, prueban las funciones del servicio directo.

## Concepto principal

La diferencia con el 23 es el enfoque:

- El 23 testeó el servicio sin pensar en HTTP.
- Aqui el objetivo es el mapa del **contrato del servicio**: cada funcion publica (`parsearFormula`, `masaMolar`, `porcentajeElemento`) tiene su suite con casos felices, casos borde y casos que deben fallar (`assert.throws(..., TypeError)`).

El error de dominio es `TypeError` (contrato de funciones puras); el controlador mapea `TypeError -> 400` en el middleware de errores, y todo lo demas queda como error interno. Ese mapeo es la frontera HTTP-y-servicio.

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
    │   └── error.handler.js  (mapea TypeError a 400)
    ├── routes/
    │   └── chemistry.routes.js
    ├── controllers/
    │   └── chemistry.controller.js
    ├── services/
    │   └── chemistry.service.js   (funciones puras)
    └── tests/
        └── chemistry.service.test.js (3 suites, 9 casos)
```

## Como ejecutar

```bash
npm install
npm test          # 9 tests: pass 9, fail 0
npm run start
```

## Tests incluidos (9 pass)

| Suite             | Caso                                            |
| ----------------- | ----------------------------------------------- |
| parsearFormula    | parsea formulas con subindices (H2O, NaCl)     |
| parsearFormula    | acumula elementos repetidos (CH3CH3 -> C2H6)   |
| parsearFormula    | TypeError en formula invalida (minuscula, vacia, ceros) |
| masaMolar         | H2O = 18.015 g/mol                              |
| masaMolar         | NaCl = 58.443 g/mol                             |
| masaMolar         | TypeError para elemento desconocido            |
| porcentajeElemento| O en NaClO3 (~45.09%)                          |
| porcentajeElemento| elemento unico = 100%                          |
| porcentajeElemento| TypeError si el elemento no aparece en la formula |

## Endpoints de la API (consumen el servicio testeado)

```bash
# Analizar una formula -> 200 con mapa de elementos y masa molar
curl -X POST http://localhost:3000/analisis \
  -H "Content-Type: application/json" \
  -d '{"formula": "NaClO3", "elemento": "O"}'

# Caso de error: formula invalida (TypeError del servicio -> 400)
curl -X POST http://localhost:3000/analisis \
  -H "Content-Type: application/json" \
  -d '{"formula": "h2o"}'

# Historial de mediciones
curl http://localhost:3000/analisis
curl http://localhost:3000/analisis/1
```

## Punto clave

Si la logica tiene su suite propia, cambiar la API (rutas, formatos) no puede romper el negocio: los tests de servicio siguen pasando y detectan la regresion en el nivel correcto.
