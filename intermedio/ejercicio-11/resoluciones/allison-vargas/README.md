# Intermedio 11 - busqueda textual (Allison Vargas)

## Que hace este ejercicio

API de musica con busqueda de texto sobre canciones y artistas. El buscador vive en un unico servicio reutilizable (`services/busqueda.service.js`) que se configura por recurso:

- `validators/busqueda/canciones.busqueda.js` y `artistas.busqueda.js`: declaran en que campos se busca, el peso de cada uno, las opciones de orden y los limites.
- `services/busqueda.service.js`: lee la consulta, valida todos los parametros (devuelve los errores juntos), puntua, resalta y pagina.
- `services/canciones.service.js` y `artistas.service.js`: cargan los datos y llaman al buscador. Los artistas se arman agrupando las canciones.

Como busca:

- Normaliza el texto: no distingue mayusculas ni acentos (`corazon` encuentra `Corazon` con tilde).
- Cada palabra se busca por separado. Con `modo=todos` (por defecto) deben aparecer todas; con `modo=alguno` basta una.
- Una frase entre comillas busca las palabras juntas y en orden: `"tren sin retorno"`.
- Un termino con `-` al inicio excluye los resultados que lo contengan: `balada -noche`.
- `coincidencia` define como se compara cada palabra: `exacta`, `prefijo` (por defecto) o `contiene`.
- La relevancia suma, por cada palabra, el mejor campo donde aparece segun su peso (titulo 5, artista 4, album 3, genero 2, descripcion 1) y la calidad de la coincidencia (exacta 1, prefijo 0.6, contiene 0.3). Las frases suman un bono.
- Cada resultado trae `resaltado` con las partes encontradas marcadas con `<mark>`. En la descripcion se devuelve un fragmento alrededor de la coincidencia.

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
    |   `-- busqueda/
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: canciones, artistas y opciones de busqueda.
- controllers: llaman al service y responden.
- services: buscador, canciones y artistas.
- validators: configuracion de busqueda por recurso y validacion de id.
- middlewares: notFound y errorHandler.
- utils: errores tipados, catchAsync, respuesta de listados y lector de JSON.
- data: 60 canciones en JSON.

## Como ejecutar

```bash
cd intermedio/ejercicio-11/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-11
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "busqueda textual"
}
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /canciones | Busca canciones. Sin `q` lista todas |
| GET | /canciones/sugerencias | Autocompletado de titulos, artistas y albumes |
| GET | /canciones/:id | Detalle de una cancion |
| GET | /artistas | Busca artistas por nombre, genero o album |
| GET | /busqueda/opciones | Sintaxis, campos, pesos y opciones disponibles |

## Parametros de consulta

| Parametro | Descripcion |
| --- | --- |
| q | Texto a buscar, de 2 a 80 caracteres y hasta 8 terminos |
| campos | Campos donde buscar, separados por coma. Por defecto todos |
| modo | `todos` (por defecto) o `alguno` |
| coincidencia | `exacta`, `prefijo` (por defecto) o `contiene` |
| orden | `relevancia` (por defecto), y en canciones `titulo`, `artista`, `anio`; en artistas `nombre`, `canciones`, `primerAnio` |
| pagina | Por defecto 1 |
| limite | Por defecto 10, maximo 50 |

Sin `q`, el orden por relevancia pasa a `titulo` (canciones) o `nombre` (artistas). `/canciones/sugerencias` recibe `q` (minimo 2 caracteres) y `limite` (de 1 a 10, por defecto 5).

```bash
curl "http://localhost:3000/intermedio/ejercicio-11/canciones?q=corazon"
curl "http://localhost:3000/intermedio/ejercicio-11/canciones?q=noche+rock&modo=alguno"
curl "http://localhost:3000/intermedio/ejercicio-11/canciones?q=%22tren%20sin%20retorno%22"
curl "http://localhost:3000/intermedio/ejercicio-11/canciones?q=balada%20-noche"
curl "http://localhost:3000/intermedio/ejercicio-11/canciones?q=rock&campos=genero&orden=anio"
curl "http://localhost:3000/intermedio/ejercicio-11/canciones?q=ana&coincidencia=contiene"
curl "http://localhost:3000/intermedio/ejercicio-11/canciones/sugerencias?q=ma"
curl "http://localhost:3000/intermedio/ejercicio-11/artistas?q=jazz"
curl "http://localhost:3000/intermedio/ejercicio-11/busqueda/opciones"
```

## Formato de respuesta

```json
{
  "ok": true,
  "data": [
    {
      "id": 20,
      "titulo": "Camino azul",
      "artista": "Duo Cielo Abierto",
      "album": "Azotea",
      "genero": "jazz",
      "anio": 2000,
      "duracionSeg": 333,
      "descripcion": "Una pieza luminosa de jazz sobre una despedida en la estacion.",
      "relevancia": 5,
      "resaltado": { "titulo": "Camino <mark>azul</mark>" }
    }
  ],
  "busqueda": {
    "q": "azul",
    "terminos": [{ "tipo": "termino", "texto": "azul", "excluir": false }],
    "campos": ["titulo", "artista", "album", "genero", "descripcion"],
    "modo": "todos",
    "coincidencia": "prefijo",
    "orden": "relevancia"
  },
  "paginacion": { "pagina": 1, "limite": 10, "total": 9, "totalPaginas": 1 }
}
```

El header `X-Total-Count` trae el total de resultados.

## Errores

```json
{
  "ok": false,
  "message": "Parametros de busqueda invalidos",
  "codigo": "BUSQUEDA_INVALIDA",
  "errores": [
    { "campo": "q", "mensaje": "q debe tener entre 2 y 80 caracteres" },
    { "campo": "modo", "mensaje": "modo debe ser uno de: todos, alguno" }
  ]
}
```

Status usados: 400 parametros o id invalidos, 404 cancion o ruta inexistente. Una busqueda sin resultados responde 200 con `data` vacio.
