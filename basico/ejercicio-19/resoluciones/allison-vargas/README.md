# Basico 19 - req.params y req.query (Allison Vargas)

## Que hace este ejercicio

Muestra diseños de tatuajes agrupados por artista, combinando req.params
y req.query en el mismo endpoint:

- GET /artistas/:artistaId/disenos?estilo=&precioMax=: artistaId viene
  de la ruta (req.params) y estilo/precioMax son filtros opcionales
  que llegan por query string (req.query).
- GET /artistas/:artistaId/disenos/:disenoId: usa DOS route params
  a la vez. El diseno no solo debe existir, tiene que pertenecer justo a
  ese artista (si disenoId existe pero es de otro artista, responde
  404 igual que si no existiera).

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- routes/
    |   `-- ejercicio.routes.js
    |-- controllers/
    |   `-- ejercicio.controller.js
    |-- services/
    |   `-- tatuajes.service.js
    `-- data/
        |-- artistas.json
        `-- disenos.json
```

## Como ejecutar

```bash
cd basico/ejercicio-19/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-19:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "req.params y req.query"
}
```

## Ejemplos

```bash
# disenos del artista 1
curl http://localhost:3000/basico/ejercicio-19/artistas/1/disenos

# combinando params (artistaId) con query (estilo, precioMax)
curl "http://localhost:3000/basico/ejercicio-19/artistas/2/disenos?estilo=geometrico"
curl "http://localhost:3000/basico/ejercicio-19/artistas/1/disenos?precioMax=130"

# artista que no existe -> 404
curl http://localhost:3000/basico/ejercicio-19/artistas/99/disenos

# diseno especifico, valido (pertenece a ese artista)
curl http://localhost:3000/basico/ejercicio-19/artistas/1/disenos/1

# diseno que existe pero es de OTRO artista -> 404
curl http://localhost:3000/basico/ejercicio-19/artistas/1/disenos/3
```
