# Avanzado 07 - cache en memoria

API de un catalogo de autos de lujo hecha con Node.js y Express. El
catalogo es "lento" (simula una base de datos o una API de precios que
tarda 300ms), y delante tiene una **cache en memoria hecha a mano**.

## Como funciona

Patron *cache-aside* (`src/servicios/autos.servicio.js`):

1. Busco en la cache.
2. Si no esta (MISS), voy al catalogo y guardo el resultado.
3. Si esta (HIT), respondo sin ir al catalogo.
4. Cuando algo cambia (el precio), borro de la cache lo que quedo viejo.

La cache (`src/cache/cache.js`):

| Que                | Como                                                        |
| ------------------ | ----------------------------------------------------------- |
| TTL                | Cada dato vence despues de `ttlMs` (30s por defecto). Se puede dar un TTL distinto por dato |
| LRU                | Con mas de `maxEntradas` saca la que hace mas tiempo que nadie usa. Uso que un `Map` recuerda el orden en que se metieron las claves |
| Pedidos en vuelo   | Si 20 piden lo mismo a la vez y no esta, se va **una** sola vez al catalogo y los 20 esperan esa respuesta (evita la "estampida") |
| Errores            | Si el catalogo falla (o el auto no existe) no se guarda nada |
| Etiquetas          | Cada dato puede tener etiquetas para borrar todo lo relacionado de una vez |
| Estadisticas       | hits, misses, expiradas, desalojadas, invalidadas y tasa de acierto |

Invalidacion al cambiar un precio: se borra `auto:<id>` y todas las
`listas`, porque cualquier lista puede tener ese auto. Los otros autos
siguen en cache.

Cada respuesta trae los headers:

- `X-Cache: HIT` o `MISS`.
- `Age`: cuantos segundos tiene el dato que se devolvio.

### Limitaciones

- La cache es de cada proceso: con varias instancias del servidor, cada
  una tiene la suya y una puede tener un precio viejo hasta que venza.
  Para eso se usa una cache compartida (Redis).
- Mientras el TTL no vence, si alguien cambia el precio **por fuera** de
  esta API, se sigue viendo el viejo. Por eso el TTL no deberia ser largo.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                        |
| ------------- | ---------------------------------- |
| `npm start`   | Servidor en http://localhost:4007  |
| `npm run dev` | Servidor con recarga automatica    |
| `npm test`    | Tests de la cache y de la API      |

## Endpoints

| Metodo | Ruta                     | Descripcion                                  |
| ------ | ------------------------ | -------------------------------------------- |
| GET    | `/health`                | El servidor vive                             |
| GET    | `/api/autos`             | Lista (cacheada por filtro `?marca=`)        |
| GET    | `/api/autos/:id`         | Un auto (cacheado)                           |
| PATCH  | `/api/autos/:id/precio`  | `{ precioUsd }`, invalida la cache           |
| GET    | `/api/cache`             | Estadisticas, claves y llamadas al catalogo  |
| DELETE | `/api/cache`             | Limpia toda la cache                         |

## Ejemplo (PowerShell)

```bash
curl.exe -i http://localhost:4007/api/autos/3
```

```text
HTTP/1.1 200 OK
X-Cache: MISS
Age: 0
```

La segunda vez (rapida, sin ir al catalogo):

```text
X-Cache: HIT
Age: 4
```

```bash
curl.exe http://localhost:4007/api/cache
```

```json
{
  "ok": true,
  "data": {
    "hits": 1, "misses": 1, "expiradas": 0, "desalojadas": 0, "invalidadas": 0,
    "entradas": 1, "maxEntradas": 100, "ttlMs": 30000, "tasaAcierto": 50,
    "claves": ["autos:3"],
    "llamadasAlCatalogo": { "listar": 0, "buscar": 1 }
  }
}
```

## Tests

- `test/cache.test.js`: MISS/HIT, TTL y `Age` con el reloj falso
  (`t.mock.timers`), TTL por dato, LRU, 10 pedidos a la vez = 1
  busqueda, errores que no se guardan, etiquetas y estadisticas.
- `test/api.test.js`: la segunda peticion es HIT y mas rapida, filtro sin
  mayusculas, 20 pedidos al mismo tiempo = 1 llamada al catalogo, cambiar
  el precio no deja ver el viejo, 404 que no se cachea, limpiar.

```text
ℹ tests 15
ℹ pass 15
ℹ fail 0
```

Para comprobar que sirven quite la invalidacion de las listas al cambiar
el precio y fallo
`cambiar el precio invalida el auto y las listas (no se ve el precio viejo)`.
