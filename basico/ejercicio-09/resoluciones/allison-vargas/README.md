# Basico 09 - JSON y persistencia simple (Allison Vargas)

## Que hace este ejercicio

Administra un listado de peleadores de kickboxing guardado en
src/data/peleadores.json. A diferencia de solo leer un archivo (visto
en el ejercicio 05), aqui POST /basico/ejercicio-09/peleadores tambien
ESCRIBE de vuelta al archivo con fs/promises (writeFile), asi que
un peleador nuevo persiste aunque se reinicie el servidor.

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
    |   `-- peleadores.service.js
    `-- data/
        `-- peleadores.json
```

- routes: define los endpoints HTTP.
- controllers: recibe la peticion, valida y arma la respuesta.
- services: lee y escribe peleadores.json (la persistencia real).
- data: archivo que se lee y se modifica.

## Como ejecutar

```bash
cd basico/ejercicio-09/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-09:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "JSON y persistencia simple"
}
```

## Listar peleadores

```bash
curl http://localhost:3000/basico/ejercicio-09/peleadores
```

## Crear un peleador (se guarda en el archivo)

```bash
curl -X POST http://localhost:3000/basico/ejercicio-09/peleadores -H "Content-Type: application/json" -d "{\"nombre\":\"Shadow Vega\",\"categoria_peso\":\"ligero\"}"
```

Respuesta:

```json
{
  "ok": true,
  "peleador": { "id": 3, "nombre": "Shadow Vega", "categoria_peso": "ligero", "record": "0-0-0" }
}
```


