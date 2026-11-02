# Ejercicio 01 - arquitectura por capas

API de heroes de un juego RPG hecha con Node.js y Express. La idea del
ejercicio es que cada archivo tenga una sola responsabilidad en vez de
poner todo en un solo server.js.

## Capas

| Carpeta        | Que hace                                                      |
| -------------- | ------------------------------------------------------------- |
| `routes/`      | Dice que URL y que metodo llaman a cada controlador           |
| `controllers/` | Lee `req`, decide el status y responde el JSON                |
| `services/`    | Logica del juego: validar, calcular poder, crear heroes       |
| `data/`        | Arreglo de heroes en memoria                                  |

`src/app.js` arma la aplicacion y `src/server.js` solo la pone a escuchar.
El servicio no conoce `req` ni `res`, asi se puede reutilizar despues.

## Requisitos

Node.js 20 o superior. Sin base de datos.

## Instalacion y ejecucion

```bash
npm install
npm start
```

| Script        | Descripcion                                      |
| ------------- | ------------------------------------------------ |
| `npm start`   | Levanta el servidor en http://localhost:3001     |
| `npm run dev` | Igual pero con recarga automatica (`node --watch`) |

El puerto se puede cambiar con la variable `PORT`.

## Endpoints

| Metodo | Ruta              | Descripcion                     |
| ------ | ----------------- | ------------------------------- |
| GET    | `/health`         | Comprueba que el servidor vive  |
| GET    | `/api/heroes`     | Lista todos los heroes          |
| GET    | `/api/heroes/:id` | Busca un heroe por id           |
| POST   | `/api/heroes`     | Crea un heroe                   |

### Campos de un heroe

- `name`: texto obligatorio.
- `class`: una de `guerrero`, `mago`, `arquero`, `clerigo`.
- `level`: entero entre 1 y 99.
- `power`: lo calcula el servicio con la clase y el nivel, no se envia.

## Ejemplos

Listar heroes:

```bash
curl.exe http://localhost:3001/api/heroes
```

```json
{
  "ok": true,
  "total": 4,
  "data": [
    { "id": 1, "name": "Aldric", "class": "guerrero", "level": 12, "power": 144 }
  ]
}
```

Crear un heroe:

```bash
curl.exe -X POST http://localhost:3001/api/heroes -H "Content-Type: application/json" -d "{\"name\":\"Mirena\",\"class\":\"mago\",\"level\":10}"
```

```json
{
  "ok": true,
  "data": { "id": 5, "name": "Mirena", "class": "mago", "level": 10, "power": 150 }
}
```

## Casos de error

Datos invalidos (400):

```bash
curl.exe -X POST http://localhost:3001/api/heroes -H "Content-Type: application/json" -d "{\"name\":\"\",\"class\":\"pirata\",\"level\":0}"
```

```json
{
  "ok": false,
  "message": "Datos invalidos",
  "errors": [
    "name es obligatorio",
    "class debe ser una de: guerrero, mago, arquero, clerigo",
    "level debe ser un entero entre 1 y 99"
  ]
}
```

Heroe que no existe (404):

```bash
curl.exe http://localhost:3001/api/heroes/99
```

```json
{ "ok": false, "message": "No existe el heroe con id 99" }
```

Ruta que no existe (404):

```bash
curl.exe http://localhost:3001/api/items
```

```json
{ "ok": false, "message": "La ruta /api/items no existe" }
```

## Notas

Los heroes viven en memoria, asi que si reinicio el servidor vuelven los
cuatro del archivo `src/data/heroes.js`.
