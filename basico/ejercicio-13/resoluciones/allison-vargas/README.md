# Basico 13 - manejo de errores (Allison Vargas)

## Que hace este ejercicio

Administra un catalogo de naves espaciales, pero el foco esta en el
manejo centralizado de errores:

- src/utils/AppError.js: una clase de error propia, con su status HTTP.
- Los controladores ya no arman la respuesta de error a mano: usan
  next(error) para delegarla al middleware central.
- app.js termina con un manejador de rutas no encontradas (404) y
  un middleware de errores de 4 parametros que responde distinto segun
  si el error era "esperado" (AppError) o no (un bug real, que se
  registra en consola pero nunca se le muestra al cliente).

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
    |   `-- naves.service.js
    |-- utils/
    |   `-- AppError.js
    `-- data/
        `-- naves.json
```

## Como ejecutar

```bash
cd basico/ejercicio-13/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-13:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "manejo de errores"
}
```

## Casos para probar el manejo de errores

```bash
# nave existente
curl http://localhost:3000/basico/ejercicio-13/naves/1

# nave inexistente -> 404, mensaje claro (AppError)
curl http://localhost:3000/basico/ejercicio-13/naves/99

# ruta que no existe -> 404, manejada por el handler de "no encontrado"
curl http://localhost:3000/basico/ejercicio-13/no-existe

# error inesperado (bug real) -> 500 con mensaje generico,
# pero el detalle completo queda en la consola del servidor
curl http://localhost:3000/basico/ejercicio-13/forzar-error
```
