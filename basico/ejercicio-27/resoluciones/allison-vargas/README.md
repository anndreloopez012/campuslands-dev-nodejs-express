# Basico 27 - logs simples 

## Que hace este ejercicio

Registra partidas de un MOBA, con dos niveles de logging escritos a
logs/app.log:

- Log de acceso HTTP (src/middlewares/logger.js): registra
  automaticamente CADA peticion (metodo, url, status, duracion en ms),
  usando el evento finish de la respuesta.
- Log de negocio (usado dentro de src/services/partidas.service.js):
  registra eventos especificos, como "Partida registrada", con su
  propio mensaje descriptivo, ademas del log de acceso automatico.

Ambos usan la misma utilidad centralizada (src/utils/logger.js), que
tambien permite leer las ultimas lineas del log
(GET /logs/recientes).

La carpeta logs/ esta en .gitignore: los logs son un efecto de
correr el servidor, no algo que se suba al repositorio.

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
    |   `-- partidas.service.js
    |-- validators/
    |   `-- partida.validator.js
    |-- middlewares/
    |   `-- logger.js
    |-- utils/
    |   `-- logger.js
    `-- data/
        `-- partidas.json
```

## Como ejecutar

```bash
cd basico/ejercicio-27/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-27:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "logs simples"
}
```

## Ejemplos

```bash
curl http://localhost:3000/basico/ejercicio-27/partidas

curl -X POST http://localhost:3000/basico/ejercicio-27/partidas -H "Content-Type: application/json" -d "{\"equipo_a\":\"Lobos de Acero\",\"equipo_b\":\"Aurora Nova\",\"duracion_min\":41,\"resultado\":\"equipo_b\"}"

# ver las ultimas lineas del log (HTTP + negocio, mezcladas por orden de tiempo)
curl "http://localhost:3000/basico/ejercicio-27/logs/recientes?cantidad=10"
```

Tambien puedes abrir logs/app.log directamente despues de correr el
servidor para ver las lineas crudas.
