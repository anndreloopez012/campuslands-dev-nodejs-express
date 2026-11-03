# Intermedio 05 - repositorios en memoria (Allison Vargas)

## Que hace este ejercicio

API de futbol y futbol sala con una capa de repositorios en memoria. La clase base `MemoryRepository` implementa el CRUD generico (`findAll`, `findById`, `findOne`, `count`, `create`, `update`, `delete`) sobre un arreglo privado con ids autoincrementales y devuelve siempre copias de los datos. Los repositorios de equipos y jugadores la extienden con consultas propias, y los services solo hablan con los repositorios, nunca con el arreglo.

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
    |-- repositories/
    |-- validators/
    |-- middlewares/
    |-- utils/
    `-- data/
```

- routes: un router por recurso y un index.js que los monta.
- controllers: validar, llamar al service y responder.
- services: reglas de negocio (posicion valida por deporte, dorsal unico, limite de plantilla).
- repositories: almacenamiento en memoria, sin reglas de negocio.
- validators: validan el body y lanzan AppError 400.
- middlewares: validacion del id, 404 y manejo central de errores.
- utils: AppError, catchAsync y lector de JSON.
- data: datos iniciales que cargan los repositorios al arrancar.

## Como ejecutar

```bash
cd intermedio/ejercicio-05/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

Los datos viven en memoria: al reiniciar el servidor vuelven a los datos iniciales.

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-05
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "repositorios en memoria"
}
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | /equipos | Lista equipos, filtro opcional `?deporte=futbol` |
| GET | /equipos/:id | Detalle de un equipo |
| GET | /equipos/:id/jugadores | Jugadores del equipo |
| POST | /equipos | Crea un equipo (`nombre`, `deporte`) |
| PUT | /equipos/:id | Actualiza un equipo |
| DELETE | /equipos/:id | Elimina un equipo sin jugadores (204) |
| GET | /jugadores | Lista jugadores, filtro opcional `?equipoId=1` |
| GET | /jugadores/:id | Detalle de un jugador |
| POST | /jugadores | Crea un jugador (`nombre`, `posicion`, `dorsal`, `equipoId`) |
| PUT | /jugadores/:id | Actualiza un jugador |
| DELETE | /jugadores/:id | Elimina un jugador (204) |

Reglas: la posicion debe existir en el deporte del equipo, el dorsal no se repite dentro del equipo y la plantilla tiene un maximo (futbol 25, futbol sala 14).

```bash
curl http://localhost:3000/intermedio/ejercicio-05/equipos/1/jugadores
curl -X POST http://localhost:3000/intermedio/ejercicio-05/jugadores -H "Content-Type: application/json" -d "{\"nombre\":\"Nico Duarte\",\"posicion\":\"defensa\",\"dorsal\":3,\"equipoId\":1}"
curl -X DELETE http://localhost:3000/intermedio/ejercicio-05/jugadores/2
```

Errores: 400 datos invalidos o posicion que no corresponde al deporte, 404 recurso inexistente, 409 nombre repetido, dorsal ocupado, plantilla completa o equipo con jugadores.
