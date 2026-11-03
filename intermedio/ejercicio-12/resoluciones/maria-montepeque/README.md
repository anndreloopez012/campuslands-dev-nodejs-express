# Ejercicio 12 - subrecursos REST

API de peliculas de miedo hecha con Node.js y Express. Las resenas son
un subrecurso: siempre se piden a traves de su pelicula, por ejemplo
`/api/peliculas/1/resenas`.

## Como funciona

- `peliculas.routes.js` monta el router de resenas en
  `/:peliculaId/resenas`.
- `resenas.routes.js` usa `Router({ mergeParams: true })` para poder
  leer `peliculaId` que viene de la ruta padre.
- Antes de tocar resenas se revisa que la pelicula exista, si no
  responde 404.
- Una resena solo se encuentra dentro de su propia pelicula:
  `/api/peliculas/2/resenas/1` da 404 porque la resena 1 es de la
  pelicula 1.

| Carpeta        | Que hay dentro                                     |
| -------------- | -------------------------------------------------- |
| `routes/`      | `index.js`, `peliculas.routes.js`, `resenas.routes.js` |
| `controllers/` | Leen params y body, responden con el status        |
| `services/`    | Validaciones y manejo de los datos                 |
| `utils/`       | `app-error.js`                                     |
| `data/`        | `db.js` con peliculas y resenas en memoria         |

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3012       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

El puerto se puede cambiar con la variable `PORT`.

## Endpoints

| Metodo | Ruta                                        | Descripcion                         |
| ------ | ------------------------------------------- | ----------------------------------- |
| GET    | `/health`                                   | Comprueba que el servidor vive      |
| GET    | `/api`                                      | Lista los recursos disponibles      |
| GET    | `/api/peliculas`                            | Lista las peliculas                 |
| GET    | `/api/peliculas/:peliculaId`                | Busca una pelicula por id           |
| GET    | `/api/peliculas/:peliculaId/resenas`        | Resenas de una pelicula             |
| POST   | `/api/peliculas/:peliculaId/resenas`        | Crea una resena para esa pelicula   |
| GET    | `/api/peliculas/:peliculaId/resenas/:resenaId` | Una resena de esa pelicula       |
| DELETE | `/api/peliculas/:peliculaId/resenas/:resenaId` | Borra una resena de esa pelicula |

### Body para crear una resena

| Campo        | Tipo   | Regla                        |
| ------------ | ------ | ---------------------------- |
| `autor`      | texto  | Obligatorio                  |
| `puntuacion` | numero | Obligatorio, entero del 1 al 5 |
| `comentario` | texto  | Opcional                     |

## Ejemplos

Resenas de El conjuro:

```bash
curl.exe http://localhost:3012/api/peliculas/1/resenas
```

```json
{
  "ok": true,
  "total": 2,
  "data": [
    { "id": 1, "peliculaId": 1, "autor": "Sofia", "puntuacion": 5, "comentario": "No pude dormir esa noche" },
    { "id": 2, "peliculaId": 1, "autor": "Carlos", "puntuacion": 4, "comentario": "Muy buenos sustos" }
  ]
}
```

Crear una resena para It (en PowerShell):

```bash
curl.exe -X POST http://localhost:3012/api/peliculas/3/resenas -H "Content-Type: application/json" -d '{\"autor\":\"Luis\",\"puntuacion\":4,\"comentario\":\"El payaso da miedo\"}'
```

```json
{
  "ok": true,
  "data": { "id": 4, "peliculaId": 3, "autor": "Luis", "puntuacion": 4, "comentario": "El payaso da miedo" }
}
```

Borrar una resena (responde 204 sin body):

```bash
curl.exe -X DELETE http://localhost:3012/api/peliculas/1/resenas/2
```

## Casos de error

Pelicula que no existe (404):

```bash
curl.exe http://localhost:3012/api/peliculas/99/resenas
```

```json
{ "ok": false, "message": "No existe la pelicula con id 99" }
```

Resena que no es de esa pelicula (404):

```bash
curl.exe http://localhost:3012/api/peliculas/2/resenas/1
```

```json
{ "ok": false, "message": "La pelicula 2 no tiene la resena 1" }
```

Id que no es numero (400):

```bash
curl.exe http://localhost:3012/api/peliculas/abc
```

```json
{ "ok": false, "message": "El id de la pelicula debe ser un numero" }
```

Body invalido (400):

```bash
curl.exe -X POST http://localhost:3012/api/peliculas/1/resenas -H "Content-Type: application/json" -d '{\"puntuacion\":9}'
```

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "errors": ["autor es obligatorio", "puntuacion debe ser un numero entero del 1 al 5"]
}
```

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/data/db.js`.
