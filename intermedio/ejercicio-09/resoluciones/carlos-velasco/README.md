# INTERMEDIO 09 - Paginacion y filtros

## Objetivo

Crear una API Node.js con Express con una sola coleccion de peleadores de kickboxing servida paginada, filtrable y ordenable por query strings.

## Concepto principal

La paginacion evita responder con miles de registros a la vez. El contrato es:

| Query | Significado | Default |
| ----- | ----------- | ------- |
| `page` | pagina pedida (>= 1) | 1 |
| `limit` | items por pagina (1-20, limitado por seguridad) | 5 |
| `nombre` | busqueda por texto parcial (case-insensitive) | - |
| `pais` | filtro exacto (se normaliza a mayusculas) | - |
| `modalidad` | filtro exacto contra catalogo (validado, 400 si no existe) | - |
| `orden` | `victorias` (desc) o `nombre` (alfabeticamente) | sin ordenar |

La respuesta siempre anuncia la paginacion para que el cliente sepa si hay mas paginas: `page, limit, total_items, total_paginas` y `total_sin_filtro`.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── fighters.routes.js
    ├── controllers/
    │   └── fighters.controller.js
    └── services/
        └── fighters.service.js
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
| GET | /fighters | Lista paginada + filtros + orden | 200 / 400 |

## Ejemplos de peticiones

```bash
# Pagina 2 con 3 items
curl "http://localhost:3000/fighters?page=2&limit=3"

# Filtro combinado: pais de japon, ordenado por victorias
curl "http://localhost:3000/fighters?pais=japon&orden=victorias"

# Texto parcial en el nombre
curl "http://localhost:3000/fighters?nombre=orto"

# Modalidad validada contra catalogo
curl "http://localhost:3000/fighters?modalidad=low%20kick&limit=2"

# Caso de error: modalidad inexistente -> 400 con el catalogo en la respuesta
curl "http://localhost:3000/fighters?modalidad=muay%20gts"

# Limites forzosamente aceptados (page mayor al total responde con lista vacia)
curl "http://localhost:3000/fighters?page=7&limit=2"
```

## Punto clave

Los parametros de paginacion se parsean con `Number.parseInt` y se encadenan `Math.max` / `Math.min` defensivamente: un cliente no puede pedir `limit=99999` ni `page=-5` y romper la respuesta.
