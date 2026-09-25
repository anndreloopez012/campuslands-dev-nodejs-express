# Basico 24 - CRUD basico 

## Que hace este ejercicio

Es el CRUD "de referencia": las cinco operaciones basicas (listar, ver
uno, crear, actualizar, borrar) sobre formulas quimicas
(nombre, formula, tipo, estado). A diferencia del ejercicio 23
(datos solo en memoria), aqui src/services/formulas.service.js usa
writeFile para guardar cada cambio de vuelta en formulas.json, asi
que los datos SI sobreviven a un reinicio del servidor.

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
    |   `-- formulas.service.js
    |-- validators/
    |   `-- formula.validator.js
    `-- data/
        `-- formulas.json
```

## Como ejecutar

```bash
cd basico/ejercicio-24/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-24:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "CRUD basico"
}
```

## CRUD

```bash
curl http://localhost:3000/basico/ejercicio-24/formulas
curl http://localhost:3000/basico/ejercicio-24/formulas/1

curl -X POST http://localhost:3000/basico/ejercicio-24/formulas -H "Content-Type: application/json" -d "{\"nombre\":\"Sal comun\",\"formula\":\"NaCl\",\"tipo\":\"inorganico\",\"estado\":\"solido\"}"

curl -X PUT http://localhost:3000/basico/ejercicio-24/formulas/1 -H "Content-Type: application/json" -d "{\"nombre\":\"Agua\",\"formula\":\"H2O\",\"tipo\":\"inorganico\",\"estado\":\"gaseoso\"}"

curl -i -X DELETE http://localhost:3000/basico/ejercicio-24/formulas/2

# id que no existe -> 404
curl http://localhost:3000/basico/ejercicio-24/formulas/99

# formula invalida (con simbolos raros) -> 400
curl -X POST http://localhost:3000/basico/ejercicio-24/formulas -H "Content-Type: application/json" -d "{\"nombre\":\"Test\",\"formula\":\"H2-O!\",\"tipo\":\"inorganico\",\"estado\":\"liquido\"}"
```

Si se reinicia el servidor despues de crear/editar/borrar, esos cambios
siguen ahi, porque quedaron guardados en formulas.json.
