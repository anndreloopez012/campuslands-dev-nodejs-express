# Intermedio 09 - paginacion y filtros (Allison Vargas)

## Que hace este ejercicio

API de kickboxing con listados paginados, filtrables, con busqueda y ordenables. Toda la logica vive en un unico motor reutilizable (`services/consulta.service.js`) que se configura por recurso:

- `validators/consultas/peleadores.consulta.js` y `combates.consulta.js`: declaran que filtros, campos ordenables y busqueda admite cada listado, mas el limite por defecto y el maximo.
- `services/consulta.service.js`: valida todos los parametros de la URL (y devuelve todos los errores juntos), filtra, busca, ordena y pagina.
- `utils/respuesta.js`: arma la respuesta del listado con los headers `X-Total-Count` y `Link` (first, prev, next, last).

Los parametros desconocidos se rechazan con 400 para que un error de escritura no devuelva resultados enganosos.

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- routes/
    |-- controllers/
    |-- services/
    |-- validators/
    |   `-- consultas/
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: peleadores y combates.
- controllers: llaman al service y responden el listado.
- services: motor de consulta, peleadores y combates.
- validators: configuracion de consultas por recurso y validacion de id.
- middlewares: notFound y errorHandler.
- utils: errores tipados, catchAsync, respuesta de listados y lector de JSON.
- data: 30 peleadores y 48 combates en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-09/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-09
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "paginacion y filtros"
}
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /peleadores | Lista paginada con filtros, busqueda y orden |
| GET | /peleadores/:id | Detalle de un peleador |
| GET | /peleadores/:id/combates | Combates de un peleador, con los mismos parametros que /combates |
| GET | /combates | Lista paginada de combates |

## Parametros de consulta

Comunes: `pagina` (por defecto 1), `limite` (por defecto 10, maximo 50), `sort` (ejemplo `victorias:desc,nombre:asc`, hasta 3 criterios) y `q` (busqueda por texto, sin distinguir mayusculas ni acentos).

Filtros de `/peleadores`:

| Parametro | Descripcion |
| --- | --- |
| categoria | Una o varias separadas por coma: `peso mosca`, `peso gallo`, `peso pluma`, `peso ligero`, `peso welter`, `peso medio`, `peso pesado` |
| pais | Uno o varios separados por coma |
| activo | `true` o `false` |
| edadMin, edadMax | Rango de edad |
| victoriasMin, kosMin | Minimos |

Ordenables: `nombre`, `edad`, `victorias`, `derrotas`, `kos`, `categoria`, `pais`. Busqueda `q` sobre nombre y apodo.

Filtros de `/combates`: `resultado` (`victoria`, `derrota`, `empate`), `metodo` (`KO`, `TKO`, `decision`), `evento`, `desde` y `hasta` (AAAA-MM-DD), `peleadorId`. Ordenables: `fecha`, `rounds`, `evento`, `resultado`. Busqueda `q` sobre el evento.

```bash
curl "http://localhost:3000/intermedio/ejercicio-09/peleadores?pagina=2&limite=5"
curl "http://localhost:3000/intermedio/ejercicio-09/peleadores?categoria=peso ligero,peso welter&activo=true&sort=victorias:desc"
curl "http://localhost:3000/intermedio/ejercicio-09/peleadores?q=trueno&edadMin=20"
curl "http://localhost:3000/intermedio/ejercicio-09/combates?metodo=KO&desde=2025-01-01&hasta=2025-12-31"
curl -i "http://localhost:3000/intermedio/ejercicio-09/peleadores?limite=10"
```

## Formato de respuesta

```json
{
  "ok": true,
  "data": [],
  "paginacion": {
    "pagina": 2,
    "limite": 5,
    "total": 30,
    "totalPaginas": 6,
    "hayAnterior": true,
    "haySiguiente": true
  },
  "consulta": {
    "filtros": { "activo": true },
    "q": null,
    "orden": ["nombre:asc"]
  }
}
```

Una pagina fuera de rango responde 200 con `data` vacio y la informacion de paginacion.

## Errores

```json
{
  "ok": false,
  "message": "Parametros de consulta invalidos",
  "codigo": "CONSULTA_INVALIDA",
  "errores": [
    { "campo": "limite", "mensaje": "limite debe ser menor o igual a 50" },
    { "campo": "color", "mensaje": "parametro no permitido" }
  ]
}
```

Status usados: 400 parametros o id invalidos, 404 peleador o ruta inexistente.
