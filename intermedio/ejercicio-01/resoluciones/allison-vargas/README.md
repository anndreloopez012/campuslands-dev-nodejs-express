# Intermedio 01 - arquitectura por capas (Allison Vargas)

## Que hace este ejercicio

API de un videojuego RPG separada en capas. Un personaje puede aceptar una mision solo si cumple las reglas del juego: nivel suficiente, mision disponible y no repetida. Las reglas viven unicamente en la capa de servicios.

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

- routes: define los endpoints y los conecta con el controller.
- controllers: recibe la peticion HTTP y arma la respuesta.
- services: reglas de negocio (nivel requerido, duplicados).
- repositories: acceso a los datos, sin reglas de negocio.
- validators: valida la forma de los datos de entrada.
- middlewares: 404 y manejo central de errores.
- utils: AppError, error con status HTTP.
- data: archivos JSON con personajes y misiones.

## Como ejecutar

```bash
cd intermedio/ejercicio-01/resoluciones/allison-vargas
npm install
npm run dev
```

El servidor queda en http://localhost:3000

## Respuesta esperada

```bash
curl http://localhost:3000/intermedio/ejercicio-01
```

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "arquitectura por capas"
}
```

## Otros endpoints

```bash
curl http://localhost:3000/intermedio/ejercicio-01/personajes
curl http://localhost:3000/intermedio/ejercicio-01/misiones
curl -X POST http://localhost:3000/intermedio/ejercicio-01/misiones/1/aceptar -H "Content-Type: application/json" -d "{\"personajeId\":1}"
```

Errores: 400 datos invalidos, 403 nivel insuficiente, 404 no existe, 409 mision repetida o no disponible.
