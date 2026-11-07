# AVANZADO 03 - validacion con schemas (Resolucion de Carlos Velasco)

Backend en Node.js + Express con tematica **MOBA** que implementa **validacion con schemas**: un mini-motor de validacion propio (sin dependencias externas) y schemas declarativos para el registro de heroes en el draft.

## Idea clave

- **Schemas declarativos** (`src/validators/heroes.schema.js`): cada campo declara `type`, `required`, reglas (`minLength`, `pattern`, `enum`, `min`, `max`, `integer`, `minItems`) y `default`.
- **Schemas anidados**: `stats` es un objeto con sus propias reglas y `abilities` valida cada elemento del arreglo contra un schema de item.
- **`strict: true`**: rechaza llaves no declaradas (protege contra payloads con campos basura).
- **Payload saneado**: si la validacion pasa, `req.body` se reemplaza por una copia limpia (solo campos declarados, strings recortados y defaults aplicados); el servicio nunca ve datos sucios.
- **Validation error detallado**: el `ValidationError` lleva `details` con un mensaje por campo.

## Como ejecutar

```bash
cd avanzado/ejercicio-03/resoluciones/carlos-velasco
npm install
npm run dev
```

## Endpoints

| Metodo | Ruta | Descripcion |
| --- | --- | --- |
| GET | `/health` | Estado de la aplicacion |
| GET | `/api/heroes?role=carry` | Listar heroes (filtro opcional por rol) |
| GET | `/api/heroes/:id` | Detalle de heroe |
| POST | `/api/heroes` | Registrar heroe (validado por schema) |

## Ejemplos con curl

```bash
curl http://localhost:3003/health
curl http://localhost:3003/api/heroes

# Caso feliz
curl -X POST http://localhost:3003/api/heroes -H "Content-Type: application/json" -d '{
  "name": "Zervera",
  "role": "assassin",
  "difficulty": 9,
  "stats": { "hp": 850, "mana": 200, "attackDamage": 70, "spellPower": 10 },
  "abilities": [{ "name": "Cuchilla Sombria", "cooldown": 8, "manaCost": 30 }]
}'

# Error de validacion: rol invalido, hp muy bajo y campo basura "sudo"
curl -X POST http://localhost:3003/api/heroes -H "Content-Type: application/json" -d '{
  "name": "X",
  "role": "duelist",
  "stats": { "hp": 50 },
  "susurro": true
}'
```

## Respuestas de error y su semantica

```json
{
  "ok": false,
  "message": "El cuerpo de la peticion no cumple el schema",
  "details": [
    "$.name debe tener al menos 2 caracteres",
    "$.role debe ser uno de: carry, support, tank, assassin",
    "$.stats.hp debe ser mayor o igual a 100",
    "$.susurro no es un campo permitido"
  ]
}
```

- `400` cuando el schema no se cumple o el heroe esta duplicado.
- `404` cuando el heroe no existe.

## Estructura

```text
src/
├── app.js
├── data/heroes.data.js
├── errors/app.error.js
├── middlewares/validate.middleware.js
├── routes/hero.routes.js
├── services/hero.service.js
└── validators/
    ├── schema.validator.js   # motor generico de validacion
    └── heroes.schema.js      # schemas declarativos del dominio
```
