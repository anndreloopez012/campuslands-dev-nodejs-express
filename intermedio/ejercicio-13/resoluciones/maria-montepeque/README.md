# Ejercicio 13 - relaciones simples

API de ciencia ficcion hecha con Node.js y Express. Hay dos recursos
relacionados: **naves** y **tripulantes**. Una nave tiene muchos
tripulantes y cada tripulante pertenece a una sola nave (uno a muchos).

## Como funciona la relacion

- Cada tripulante guarda `naveId`, que es el id de su nave (como una
  llave foranea).
- `GET /api/tripulantes` cambia `naveId` por un objeto `nave` con su id
  y nombre, como si fuera un join.
- `GET /api/naves/:id` devuelve la nave con su lista de `tripulantes`.
- `GET /api/naves` muestra cuantos tripulantes tiene cada nave.
- Al crear un tripulante, `naveId` tiene que ser de una nave que exista.
- No se puede borrar una nave que todavia tiene tripulantes (409).

| Carpeta        | Que hay dentro                                     |
| -------------- | -------------------------------------------------- |
| `routes/`      | `index.js`, `naves.routes.js`, `tripulantes.routes.js` |
| `controllers/` | Leen params y body, responden con el status        |
| `services/`    | Validaciones y armado de las relaciones            |
| `utils/`       | `app-error.js`                                     |
| `data/`        | `db.js` con naves y tripulantes en memoria         |

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                        |
| ------------- | -------------------------------------------------- |
| `npm start`   | Levanta el servidor en http://localhost:3013       |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

El puerto se puede cambiar con la variable `PORT`.

## Endpoints

| Metodo | Ruta                    | Descripcion                                 |
| ------ | ----------------------- | ------------------------------------------- |
| GET    | `/health`               | Comprueba que el servidor vive              |
| GET    | `/api`                  | Lista los recursos disponibles              |
| GET    | `/api/naves`            | Lista naves con `totalTripulantes`          |
| GET    | `/api/naves/:id`        | Una nave con sus tripulantes                |
| DELETE | `/api/naves/:id`        | Borra una nave (solo si no tiene gente)     |
| GET    | `/api/tripulantes`      | Lista tripulantes con su nave               |
| GET    | `/api/tripulantes/:id`  | Un tripulante con su nave                   |
| POST   | `/api/tripulantes`      | Crea un tripulante en una nave              |
| DELETE | `/api/tripulantes/:id`  | Borra un tripulante                         |

### Body para crear un tripulante

| Campo    | Tipo   | Regla                                   |
| -------- | ------ | --------------------------------------- |
| `nombre` | texto  | Obligatorio                             |
| `rol`    | texto  | Obligatorio                             |
| `naveId` | numero | Obligatorio, tiene que existir la nave  |

## Ejemplos

Nave con sus tripulantes:

```bash
curl.exe http://localhost:3013/api/naves/1
```

```json
{
  "ok": true,
  "data": {
    "id": 1,
    "nombre": "Odisea",
    "clase": "Exploracion",
    "tripulantes": [
      { "id": 1, "nombre": "Elena Vasquez", "rol": "Capitana", "naveId": 1 },
      { "id": 2, "nombre": "Tomas Rek", "rol": "Piloto", "naveId": 1 },
      { "id": 4, "nombre": "Unidad K-9", "rol": "Androide", "naveId": 1 }
    ]
  }
}
```

Tripulante con su nave:

```bash
curl.exe http://localhost:3013/api/tripulantes/3
```

```json
{
  "ok": true,
  "data": { "id": 3, "nombre": "Yara Sol", "rol": "Ingeniera", "nave": { "id": 2, "nombre": "Halcon Estelar" } }
}
```

Crear un tripulante en la nave Aurora (en PowerShell):

```bash
curl.exe -X POST http://localhost:3013/api/tripulantes -H "Content-Type: application/json" -d '{\"nombre\":\"Mara Lin\",\"rol\":\"Medica\",\"naveId\":3}'
```

```json
{
  "ok": true,
  "data": { "id": 5, "nombre": "Mara Lin", "rol": "Medica", "nave": { "id": 3, "nombre": "Aurora" } }
}
```

## Casos de error

Nave que no existe al crear un tripulante (400):

```bash
curl.exe -X POST http://localhost:3013/api/tripulantes -H "Content-Type: application/json" -d '{\"nombre\":\"Zed\",\"rol\":\"Piloto\",\"naveId\":42}'
```

```json
{ "ok": false, "message": "No se puede asignar a la nave 42 porque no existe" }
```

Body incompleto (400):

```bash
curl.exe -X POST http://localhost:3013/api/tripulantes -H "Content-Type: application/json" -d '{\"rol\":\"\"}'
```

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "errors": ["nombre es obligatorio", "rol es obligatorio", "naveId debe ser un numero entero"]
}
```

Borrar una nave con tripulantes (409):

```bash
curl.exe -X DELETE http://localhost:3013/api/naves/1
```

```json
{ "ok": false, "message": "La nave 1 tiene tripulantes, primero hay que moverlos o borrarlos" }
```

Nave que no existe (404):

```bash
curl.exe http://localhost:3013/api/naves/99
```

```json
{ "ok": false, "message": "No existe la nave con id 99" }
```

## Notas

Los datos viven en memoria, al reiniciar el servidor vuelven a los de
`src/data/db.js`.
