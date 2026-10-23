# Basico 14 - validacion de entrada (Allison Vargas)

## Que hace este ejercicio

Administra un catalogo de libros. El foco esta en
src/validators/libro.validator.js: una funcion dedicada que revisa
TODOS los campos del body (titulo, autor, anio_publicacion,
paginas) y devuelve la lista completa de errores encontrados, no solo
el primero. Si algo falla, POST /basico/ejercicio-14/libros responde
400 con todos los problemas juntos. 

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
    |   `-- libros.service.js
    |-- validators/
    |   `-- libro.validator.js
    `-- data/
        `-- libros.json
```

## Como ejecutar

```bash
cd basico/ejercicio-14/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-14:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "validacion de entrada"
}
```

## Casos de validacion

```bash
# valido
curl -X POST http://localhost:3000/basico/ejercicio-14/libros -H "Content-Type: application/json" -d "{\"titulo\":\"Sombras de Papel\",\"autor\":\"Elena Vidal\",\"anio_publicacion\":2020,\"paginas\":180}"

# faltan titulo y autor, anio invalido -> 400 con varios errores juntos
curl -X POST http://localhost:3000/basico/ejercicio-14/libros -H "Content-Type: application/json" -d "{\"anio_publicacion\":3000}"

# paginas invalida (negativa) -> 400
curl -X POST http://localhost:3000/basico/ejercicio-14/libros -H "Content-Type: application/json" -d "{\"titulo\":\"Prueba\",\"autor\":\"Test\",\"anio_publicacion\":2020,\"paginas\":-5}"
```
