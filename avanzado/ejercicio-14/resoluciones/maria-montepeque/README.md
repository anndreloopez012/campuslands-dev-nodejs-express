# Avanzado 14 - metricas simples

API de una biblioteca (prestar y devolver libros) hecha con Node.js y
Express que **expone metricas**: cuantas peticiones hubo, cuanto
tardaron, cuantos libros se prestaron, cuanta memoria usa el proceso.
Los logs (avanzado 13) cuentan **que paso**; las metricas dicen **cuanto
y que tan rapido**, y sirven para graficos y alertas.

## El registro de metricas (`src/metricas/registro.js`)

Hecho a mano, con la misma idea que `prom-client`:

| Tipo        | Para que                                      | Ejemplo aqui                          |
| ----------- | --------------------------------------------- | ------------------------------------- |
| Contador    | Algo que solo sube                            | `http_requests_total`, `biblioteca_prestamos_total` |
| Medidor     | Algo que sube y baja                          | `biblioteca_prestamos_activos`, memoria |
| Histograma  | Repartir valores en baldes ("cuantas tardaron menos de 50ms") | `http_request_duration_seconds` |

- Cada metrica tiene **etiquetas** (`metodo`, `ruta`, `status`, `genero`)
  y guarda un valor por combinacion. Usar una etiqueta que no se declaro
  da error.
- Algunos medidores **se calculan al leerlos** (memoria, uptime, copias
  disponibles), en vez de actualizarlos a cada rato.
- El histograma guarda tambien las ultimas 1000 muestras para dar
  percentiles exactos (p50, p95, p99) en el JSON.

## Cosas que aprendi

### Etiquetar por patron de ruta, no por URL

`/api/libros/1`, `/api/libros/2`... son la misma ruta. Si la etiqueta
fuera la URL real, habria una serie por cada id: miles de series
(**explosion de cardinalidad**), que es la forma mas comun de tumbar un
Prometheus. Por eso el middleware (`src/metricas/http.js`) usa
`req.baseUrl + req.route.path` = `/api/libros/:id`, y las rutas que no
existen se agrupan como `no_encontrada`. Lo mismo con usuarios: nunca va
el id de usuario como etiqueta.

### El promedio miente, los percentiles no

Si 18 peticiones tardan 2ms y 2 tardan 120ms, el promedio es ~14ms y
parece todo bien. El **p95** muestra que el 5% de los usuarios espera mas
de 100ms. Hay un test con ese caso exacto.

### Metricas del negocio

Ademas de las HTTP: prestamos y devoluciones por genero, prestamos
activos, copias disponibles por genero y rechazos por motivo
(`sin_copias`, `no_prestado`). Son las que le importan al dueno de la
biblioteca.

### Metricas del proceso

Memoria (`rss`), segundos encendido y el **retraso del event loop**
(p99, con `monitorEventLoopDelay`). Si algo sincrono pesado traba el
servidor, ese numero sube.

## Endpoints

| Metodo | Ruta                         | Descripcion                                  |
| ------ | ---------------------------- | -------------------------------------------- |
| GET    | `/health`                    | El servidor vive                             |
| GET    | `/api/libros`                | Libros con copias disponibles                |
| GET    | `/api/libros/:id`            | Un libro                                     |
| POST   | `/api/libros/:id/prestar`    | Presta una copia (409 si no quedan)          |
| POST   | `/api/libros/:id/devolver`   | Devuelve una copia                           |
| GET    | `/metrics`                   | Formato de texto de Prometheus               |
| GET    | `/api/metricas`              | JSON con percentiles                         |
| GET    | `/api/lento?ms=`             | Para probar peticiones lentas                |

Si existe la variable `METRICS_TOKEN`, `/metrics` y `/api/metricas` piden
`Authorization: Bearer <token>`, porque muestran cosas internas.

## Ejemplo

```bash
curl.exe -X POST http://localhost:4014/api/libros/1/prestar
```

```bash
curl.exe http://localhost:4014/metrics
```

```text
# HELP http_requests_total Peticiones HTTP atendidas
# TYPE http_requests_total counter
http_requests_total{metodo="POST",ruta="/api/libros/:id/prestar",status="200"} 1
# HELP http_request_duration_seconds Duracion de las peticiones HTTP en segundos
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{metodo="POST",ruta="/api/libros/:id/prestar",le="0.005"} 1
...
http_request_duration_seconds_bucket{metodo="POST",ruta="/api/libros/:id/prestar",le="+Inf"} 1
http_request_duration_seconds_sum{metodo="POST",ruta="/api/libros/:id/prestar"} 0.0012
http_request_duration_seconds_count{metodo="POST",ruta="/api/libros/:id/prestar"} 1
# HELP biblioteca_prestamos_total Libros prestados
# TYPE biblioteca_prestamos_total counter
biblioteca_prestamos_total{genero="novela"} 1
# HELP biblioteca_disponibles Copias disponibles por genero
# TYPE biblioteca_disponibles gauge
biblioteca_disponibles{genero="novela"} 6
biblioteca_disponibles{genero="cuento"} 1
...
```

Con un Prometheus de verdad, se apunta a `http://localhost:4014/metrics`
y se pueden hacer consultas como
`histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))`.

## Requisitos e instalacion

Node.js 20 o superior. Sin base de datos.

```bash
npm install
npm start
```

| Script        | Descripcion                        |
| ------------- | ---------------------------------- |
| `npm start`   | Servidor en http://localhost:4014  |
| `npm run dev` | Servidor con recarga automatica    |
| `npm test`    | Tests del registro y de la API     |

## Tests

- `test/registro.test.js`: contador (no baja), etiquetas no declaradas,
  medidor, baldes del histograma, nombres invalidos, percentiles, formato
  Prometheus exacto y escape de comillas.
- `test/api.test.js`: patron de ruta (5 ids = 1 serie), status y
  `no_encontrada`, histograma HTTP, p50 vs p95 con algunas lentas,
  metricas del negocio, del proceso, y el token.

```text
ℹ tests 15
ℹ pass 15
ℹ fail 0
```

Para comprobar que sirven puse la URL real como etiqueta de ruta y
fallaron 3 tests, empezando por
`cuenta por patron de ruta, no por URL real (sin explosion de series)`.
