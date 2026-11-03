# Intermedio 02 - routers modulares (Allison Vargas)

## Que hace este ejercicio

API de un shooter competitivo dividida en routers modulares. Cada recurso (jugadores, armas y partidas) tiene su propio router, controller y service, y un router principal los monta bajo `/intermedio/ejercicio-02`.

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
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: un router por recurso y un index.js que los monta.
- controllers: recibe la peticion HTTP y arma la respuesta.
- services: reglas de negocio y acceso a los datos.
- validators: valida el body de las peticiones.
- middlewares: validacion del id, 404 y manejo central de errores.
- utils: AppError y lector de JSON.
- data: archivos JSON con jugadores y armas.

## Como ejecutar

```bash
cd intermedio/ejercicio-02/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-02
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "routers modulares"
}
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /jugadores | Lista jugadores, filtro opcional `?rango=oro` |
| GET | /jugadores/:id | Detalle de un jugador |
| POST | /jugadores | Crea un jugador (`nick`, `rango`) |
| GET | /armas | Lista armas, filtro opcional `?tipo=rifle` |
| GET | /armas/:id | Detalle de un arma |
| GET | /partidas | Lista partidas |
| POST | /partidas | Crea una partida (`mapa`, `jugadores`) |

```bash
curl http://localhost:3000/intermedio/ejercicio-02/jugadores?rango=oro
curl -X POST http://localhost:3000/intermedio/ejercicio-02/jugadores -H "Content-Type: application/json" -d "{\"nick\":\"Blaze\",\"rango\":\"plata\"}"
curl -X POST http://localhost:3000/intermedio/ejercicio-02/partidas -H "Content-Type: application/json" -d "{\"mapa\":\"Ascent\",\"jugadores\":[1,2]}"
```

Errores: 400 datos invalidos o id incorrecto, 404 recurso inexistente, 409 nick repetido.
