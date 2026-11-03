# Ejercicio 11 - busqueda textual

API de musica hecha con Node.js y Express. Tiene una lista de canciones
en memoria y una ruta para buscarlas por texto.

## Como funciona la busqueda

- Se busca con `q` en el titulo, artista, album y genero.
- No importan mayusculas ni tildes: `cafe` encuentra "Ojalá que llueva café".
- Busca por coincidencia parcial, `arj` encuentra a "Ricardo Arjona".
- Con `campo` se puede buscar solo en uno de los campos.
- `q` debe tener al menos 2 letras, si no responde 400.

| Carpeta        | Que hay dentro                                  |
| -------------- | ----------------------------------------------- |
| `routes/`      | `index.js` y `canciones.routes.js`              |
| `controllers/` | Lee `req.query` / `req.params` y responde       |
| `services/`    | Validacion y logica de la busqueda              |
| `utils/`       | `normalize-text.js` y `app-error.js`            |
| `data/`        | `canciones.js` con los datos en memoria         |

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3011       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

El puerto se puede cambiar con la variable `PORT`.

## Endpoints

| Metodo | Ruta                     | Descripcion                        |
| ------ | ------------------------ | ---------------------------------- |
| GET    | `/health`                | Comprueba que el servidor vive     |
| GET    | `/api`                   | Lista los recursos disponibles     |
| GET    | `/api/canciones`         | Lista todas las canciones          |
| GET    | `/api/canciones/buscar`  | Busca canciones por texto          |
| GET    | `/api/canciones/:id`     | Busca una cancion por id           |

### Query params de `/api/canciones/buscar`

- `q` (obligatorio): texto a buscar, minimo 2 letras.
- `campo` (opcional): `titulo`, `artista`, `album` o `genero`.

## Ejemplos

Buscar en todos los campos:

```bash
curl.exe "http://localhost:3011/api/canciones/buscar?q=arjona"
```

```json
{
  "ok": true,
  "query": "arjona",
  "total": 2,
  "data": [
    { "id": 2, "titulo": "Te conozco", "artista": "Ricardo Arjona", "album": "Animal nocturno", "genero": "Balada" },
    { "id": 6, "titulo": "Historia de taxi", "artista": "Ricardo Arjona", "album": "Historias", "genero": "Balada" }
  ]
}
```

Sin tildes ni mayusculas:

```bash
curl.exe "http://localhost:3011/api/canciones/buscar?q=CAFE"
```

Solo en el titulo:

```bash
curl.exe "http://localhost:3011/api/canciones/buscar?q=bachata&campo=titulo"
```

Sin resultados (responde 200 con lista vacia):

```bash
curl.exe "http://localhost:3011/api/canciones/buscar?q=cumbia"
```

```json
{ "ok": true, "query": "cumbia", "total": 0, "data": [] }
```

## Casos de error

Sin `q` o muy corto (400):

```bash
curl.exe "http://localhost:3011/api/canciones/buscar?q=a"
```

```json
{ "ok": false, "message": "El parametro q es obligatorio y debe tener al menos 2 letras" }
```

Campo que no existe (400):

```bash
curl.exe "http://localhost:3011/api/canciones/buscar?q=rock&campo=duracion"
```

```json
{ "ok": false, "message": "El campo \"duracion\" no existe, usa uno de: titulo, artista, album, genero" }
```

Cancion que no existe (404):

```bash
curl.exe http://localhost:3011/api/canciones/99
```

```json
{ "ok": false, "message": "No existe la cancion con id 99" }
```

## Notas

Los datos viven en memoria en `src/data/canciones.js`.
