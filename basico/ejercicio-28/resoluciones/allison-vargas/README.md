# Basico 28 - configuracion por entorno 

## Que hace este ejercicio

Simula un servidor de battle royale donde el maximo de jugadores por
partida CAMBIA SEGUN EL ENTORNO:

- development: 4 jugadores (partidas chicas para probarlo rapido).
- test: 2 jugadores (partidas minimas para pruebas automatizadas).
- production: 100 jugadores (partida real).

src/config/index.js lee NODE_ENV y elige cual archivo de
src/config/environments/ cargar. El resto del codigo (controlador,
servicio) nunca sabe en que entorno esta corriendo: solo usa
config.maxJugadoresPorPartida.

## Estructura

```text
.
|-- package.json
|-- README.md
`-- src
    |-- app.js
    |-- server.js
    |-- config/
    |   |-- index.js
    |   `-- environments/
    |       |-- development.js
    |       |-- production.js
    |       `-- test.js
    |-- routes/
    |   `-- ejercicio.routes.js
    |-- controllers/
    |   `-- ejercicio.controller.js
    `-- services/
        `-- partidas.service.js
```

## Como ejecutar

```bash
cd basico/ejercicio-28/resoluciones/allison-vargas
npm install
npm run dev
```

Sin nada especial, corre en development (4 jugadores maximo).

## Probar otros entornos

En PowerShell:

```powershell
$env:NODE_ENV="production"; node src/server.js
```

En bash/Git Bash:

```bash
NODE_ENV=production node src/server.js
```

Respuesta esperada en GET /basico/ejercicio-28:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "configuracion por entorno"
}
```

## Ver la configuracion activa

```bash
curl http://localhost:3000/basico/ejercicio-28/config
```

## Crear una partida (el limite depende del entorno)

```bash
# en development (limite 4), esto funciona -> 201
curl -X POST http://localhost:3000/basico/ejercicio-28/partidas -H "Content-Type: application/json" -d "{\"numero_jugadores\":4}"

# en development, esto excede el limite -> 400
curl -X POST http://localhost:3000/basico/ejercicio-28/partidas -H "Content-Type: application/json" -d "{\"numero_jugadores\":50}"
```

El mismo numero_jugadores: 50 funcionaria sin problema si el
servidor estuviera corriendo con NODE_ENV=production.
