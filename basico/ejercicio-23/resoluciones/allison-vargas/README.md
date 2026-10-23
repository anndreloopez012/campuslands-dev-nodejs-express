# Basico 23 - datos en memoria 

## Que hace este ejercicio

CRUD completo de soldaduras (tipo_soldadura, material, estado).
El foco esta en src/services/soldaduras.service.js: los datos viven
unicamente en un array de JavaScript en memoria (let soldaduras = [...]),
sin leer ni escribir ningun archivo. Por eso todo el controlador es
sincrono, sin await en ningun lado.

La ventaja es que es instantaneo. La desventaja real: al reiniciar el
servidor, cualquier soldadura creada, editada o borrada durante esa
ejecucion desaparece, y vuelve a arrancar solo con las dos
soldaduras semilla del codigo.  

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
    |   `-- soldaduras.service.js
    `-- validators/
        `-- soldadura.validator.js
```

## Como ejecutar

```bash
cd basico/ejercicio-23/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-23:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "datos en memoria"
}
```

## CRUD

```bash
curl http://localhost:3000/basico/ejercicio-23/soldaduras
curl http://localhost:3000/basico/ejercicio-23/soldaduras/1

curl -X POST http://localhost:3000/basico/ejercicio-23/soldaduras -H "Content-Type: application/json" -d "{\"tipo_soldadura\":\"arco\",\"material\":\"hierro\",\"estado\":\"pendiente\"}"

curl -X PUT http://localhost:3000/basico/ejercicio-23/soldaduras/1 -H "Content-Type: application/json" -d "{\"tipo_soldadura\":\"MIG\",\"material\":\"acero\",\"estado\":\"en_proceso\"}"

curl -i -X DELETE http://localhost:3000/basico/ejercicio-23/soldaduras/2
```

## Para comprobar que es "en memoria" de verdad

1. Crea una soldadura con el POST de arriba.
2. Confirma que aparece con GET /soldaduras.
3. Detén el servidor (Ctrl+C) y vuelve a correr npm run dev.
4. Consulta GET /soldaduras otra vez: la soldadura que creaste ya no
   esta, porque nunca se guardo en ningun archivo.
