# Avanzado 14 - Metricas simples (libros)

API en Node.js y Express para una biblioteca que presta libros. Junto con la API se construye, sin librerias externas, un pequeno sistema de metricas compatible con el formato de texto de Prometheus: contadores, medidores e histogramas, metricas HTTP automaticas y metricas del negocio.

## Como ejecutarlo

```bash
npm install
npm start          # puerto 3000, cambia con PORT=3100
npm test
npm run test:cobertura
```

Ruta base: `/avanzado/ejercicio-14`. Los datos viven en memoria (12 libros en `src/data/libros.json`).

## Probar rapido

```bash
curl http://localhost:3000/avanzado/ejercicio-14/libros
curl -H "Content-Type: application/json" -d '{"libroId":1,"lector":"Ana Torres"}' \
  http://localhost:3000/avanzado/ejercicio-14/prestamos
curl -X POST http://localhost:3000/avanzado/ejercicio-14/prestamos/1/devolucion
curl http://localhost:3000/avanzado/ejercicio-14/metrics
curl http://localhost:3000/avanzado/ejercicio-14/metrics/resumen
```

## Tipos de metrica (`src/metricas/registro.js`)

| Tipo | Para que sirve | Ejemplo |
| --- | --- | --- |
| Contador (`counter`) | Algo que solo aumenta | prestamos realizados |
| Medidor (`gauge`) | Un valor que sube y baja | peticiones en curso, ejemplares disponibles |
| Histograma (`histogram`) | Distribucion de valores en rangos (buckets) | duracion de peticiones, dias de prestamo |

Reglas que valida el registro:

- Nombres y etiquetas en `snake_case`; `le` y las que empiezan con `__` estan reservadas.
- Cada observacion debe traer exactamente las etiquetas declaradas.
- Un contador no puede bajar ni recibir `NaN`.
- Buckets estrictamente crecientes.
- **Cardinalidad limitada**: cada metrica guarda como maximo 200 series. Si se supera, la observacion se descarta y se cuenta en `seriesDescartadas`. Asi un error (por ejemplo usar el id del usuario como etiqueta) no agota la memoria.
- Un medidor puede tener `recolectar()`: su valor se calcula en el momento de leer las metricas (por ejemplo los ejemplares disponibles).

## Metricas expuestas

| Metrica | Tipo | Etiquetas |
| --- | --- | --- |
| `http_peticiones_total` | counter | `metodo`, `ruta`, `status` |
| `http_duracion_segundos` | histogram | `metodo`, `ruta` |
| `http_peticiones_en_curso` | gauge | |
| `biblioteca_prestamos_total` | counter | `genero` |
| `biblioteca_prestamos_rechazados_total` | counter | `motivo` (`sin_ejemplares`, `limite_lector`) |
| `biblioteca_devoluciones_total` | counter | `puntual` (`si`, `no`) |
| `biblioteca_dias_prestamo` | histogram | buckets 1, 3, 7, 14, 21, 30, 60 |
| `biblioteca_prestamos_activos` | gauge | |
| `biblioteca_ejemplares_disponibles` | gauge | `genero` |

La etiqueta `ruta` usa el **patron** (`/libros/:id`) y no la url real (`/libros/7`), para no crear una serie por cada id. Las rutas que no existen se agrupan como `sin_ruta`. El patron se captura en el momento en que Express asigna `req.route`, asi tambien queda bien cuando la ruta termina en error.

## Rutas

| Metodo y ruta | Que hace |
| --- | --- |
| `GET /` | Informacion del ejercicio |
| `GET /metrics` | Metricas en formato texto de Prometheus (`text/plain; version=0.0.4`) |
| `GET /metrics/json` | Las mismas metricas en JSON |
| `GET /metrics/resumen` | Resumen legible: total de peticiones, errores 4xx/5xx, tasa de error, latencia p50/p95/p99 estimada desde el histograma, rutas mas usadas y numeros de la biblioteca |
| `GET /libros?genero=` | Libros con sus ejemplares disponibles |
| `GET /libros/:id` | Detalle |
| `GET /prestamos?activos=true|false` | Prestamos |
| `POST /prestamos` | `{ libroId, lector }`. Vence a los 14 dias. Maximo 3 prestamos activos por lector |
| `POST /prestamos/:id/devolucion` | Devuelve. Calcula dias, atraso y multa (500 por dia de atraso) |

Los percentiles se estiman interpolando dentro del bucket donde cae el percentil, igual que `histogram_quantile` de Prometheus.

## Errores

| Codigo | Estado | Cuando |
| --- | --- | --- |
| `VALIDACION` | 400 | Datos o filtros invalidos |
| `JSON_INVALIDO` | 400 | Body que no es JSON |
| `LIBRO_NO_ENCONTRADO`, `PRESTAMO_NO_ENCONTRADO` | 404 | No existe |
| `RUTA_NO_ENCONTRADA` | 404 | Ruta desconocida |
| `METODO_NO_PERMITIDO` | 405 | Metodo no admitido (cabecera `Allow`) |
| `SIN_EJEMPLARES` | 409 | No quedan ejemplares del libro |
| `LIMITE_DE_PRESTAMOS` | 409 | El lector ya tiene 3 prestamos activos |
| `PRESTAMO_YA_DEVUELTO` | 409 | Se intenta devolver dos veces |
| `PAYLOAD_GRANDE` | 413 | Body muy grande |
| `FORMATO_NO_SOPORTADO` | 415 | Falta `Content-Type: application/json` |
| `ERROR_INTERNO` | 500 | Error inesperado |

## Estructura

```
src/
  app.js, server.js
  metricas/     registro (counter, gauge, histogram), formato (Prometheus y percentiles), http (middleware)
  services/     biblioteca (prestamos y metricas de negocio), metricas (texto, json y resumen)
  routes/       biblioteca, metricas
  validators/   validaciones escritas a mano
  middlewares/  errores, notFound, metodoNoPermitido, exigirTipo
  errores/      catalogo de errores
test/           registro, formato y pruebas de API
soporte/        reloj y cronometro falsos para que las duraciones sean exactas
```
