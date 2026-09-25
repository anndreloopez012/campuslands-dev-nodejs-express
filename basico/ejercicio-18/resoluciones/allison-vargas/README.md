# Basico 18 - rutas POST (Allison Vargas)

## Que hace este ejercicio

Administra reservas de salto en paracaidas. Lo principalesta en
POST /basico/ejercicio-18/saltos:

- Necesita app.use(express.json()) en app.js para que req.body
  funcione (sin eso, llegaria vacio).
- Valida el body completo (nombre, peso_kg, nivel) antes de crear
  nada, incluyendo una regla real de paracaidismo: peso_kg debe estar
  entre 40 y 120 kg (limite de seguridad del equipo en tandem).
- Si todo es valido, responde 201 Created (no 200) y devuelve el
  recurso recien creado.

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
    |   `-- saltos.service.js
    `-- validators/
        `-- salto.validator.js
```

## Como ejecutar

```bash
cd basico/ejercicio-18/resoluciones/allison-vargas
npm install
npm run dev
```

Respuesta esperada en GET /basico/ejercicio-18:

```json
{
  "ok": true,
  "message": "Ejercicio ejecutado correctamente",
  "topic": "rutas POST"
}
```

## Ejemplos

```bash
# valido -> 201
curl -X POST http://localhost:3000/basico/ejercicio-18/saltos -H "Content-Type: application/json" -d "{\"nombre\":\"Mateo Rios\",\"peso_kg\":78,\"nivel\":\"principiante\"}"

# peso fuera de rango -> 400
curl -X POST http://localhost:3000/basico/ejercicio-18/saltos -H "Content-Type: application/json" -d "{\"nombre\":\"Ligero\",\"peso_kg\":25,\"nivel\":\"principiante\"}"

# nivel invalido -> 400
curl -X POST http://localhost:3000/basico/ejercicio-18/saltos -H "Content-Type: application/json" -d "{\"nombre\":\"Test\",\"peso_kg\":70,\"nivel\":\"experto\"}"

# listar reservas creadas
curl http://localhost:3000/basico/ejercicio-18/saltos
```
