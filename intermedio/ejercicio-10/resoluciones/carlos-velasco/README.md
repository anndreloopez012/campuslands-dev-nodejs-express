# INTERMEDIO 10 - Ordenamiento de resultados

## Objetivo

Crear una API Node.js con Express que ordene resultados dinamicamente segun query strings, con campos y direcciones validados contra una lista blanca (whitelist).

## Concepto principal

Ordenar por entrada del cliente es inseguro si se traduce directamente: hay que validar contra una **lista blanca**. Aqui:

- `camposOrdenables` es un mapa `campo -> funcion consultora`; solo los campos del mapa pueden usarse.
- `direccion` solo acepta `asc` o `desc`.
- El ordenamiento usa `Array.sort` con un `factor = 1 | -1`, lo que repite la misma logica de comparacion para ambos sentidos.
- Hay desempate estable por `id` para que el orden sea predecible cuando dos valores coincide.
- Filtro extra deducido: `pais` (exacto, normalizado a mayusculas).

La respuesta tambien devuelve un bloque `sorting` con los campos disponibles: el cliente puede descubrir las opciones sin leer la documentacion.

## Estructura del proyecto

```text
resoluciones/carlos-velasco/
├── package.json
├── README.md
└── src/
    ├── app.js
    ├── routes/
    │   └── players.routes.js
    ├── controllers/
    │   └── players.controller.js
    └── services/
        └── players.service.js
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
| GET | /players | Lista jugadores ordenable + filtro por pais | 200 / 400 |

## Ejemplos de peticiones

```bash
# Orden por ranking descendente (default)
curl "http://localhost:3000/players"

# Orden por campeonatos ascendente
curl "http://localhost:3000/players?ordenar=campeonatos&direccion=asc"

# Orden alfabetico por nombre
curl "http://localhost:3000/players?ordenar=name&direccion=asc"

# Combinado: solo jugadores de china, ordenados por puntos
curl "http://localhost:3000/players?pais=china&ordenar=puntos&direccion=desc"

# Caso de error: campo no ordenable -> 400 con lista de campos validos
curl "http://localhost:3000/players?ordenar=edad"

# Caso de error: direccion invalida -> 400
curl "http://localhost:3000/players?direccion=ascendente"
```

## Punto clave

El servicio nunca construye SQL ni texto con la entrada del cliente: la lista blanca garantiza que solo campos **conocidos** alcancen la funcion de comparacion.
